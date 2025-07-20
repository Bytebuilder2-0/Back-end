const Auth = require("../models/auth.js"); // Import your model
const Technician = require("../models/Technician.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { addToBlacklist } = require("../utils/blacklist.js"); // Import the blacklist utility
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// User Registration with Role-based access
const registerUser = async(req, res) => {
    try {
        const { email, fullName, userName, phone, password, role, department } = req.body;

        // 1. Basic validations
        if (!email || !fullName || !userName || !phone || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const allowedRoles = ["customer", "technician", "manager", "supervisor"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid Role Provided" });
        }

        // Check if email already exists in either collection
        const authExists = await Auth.findOne({ email });
        const userExists = await User.findOne({ email });

        if (authExists || userExists) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ========== CUSTOMER ONLY ==========
        if (role === "customer") {
            const newCustomer = new User({
                name: fullName,
                email,
				userName,
				phone,  //========================================================
                password: hashedPassword,
				isApproved: (role === "customer" || role === "manager"), // auto-approved roles
                vehicles: [], // start empty
            });

            await newCustomer.save();

            return res.status(201).json({
                message: "Customer registered successfully",
            });
        }

        // ========== TECHNICIAN, MANAGER, SUPERVISOR ==========
        const newUser = new Auth({
            email,
            fullName,
            userName,
            phone,
            password: hashedPassword,
            role,
        });
        const savedUser = await newUser.save();

        // Technician-specific handling
        if (role === "technician") {
            const generateRandomEmployeeId = () => {
                return `TECH-${Math.floor(10000 + Math.random() * 90000)}`;
            };

            let generatedEmployeeId = generateRandomEmployeeId();
            let exists = await Technician.findOne({ employee_id: generatedEmployeeId });
            while (exists) {
                generatedEmployeeId = generateRandomEmployeeId();
                exists = await Technician.findOne({ employee_id: generatedEmployeeId });
            }

            console.log("Saving technician with employee_id:", generatedEmployeeId);

            const newTechnician = new Technician({
                technician_id: generatedEmployeeId,
                employee_id: generatedEmployeeId,
                department: department || "General",
                email,
                fullName,
                userName,
                password: hashedPassword,
            });

            try {
                await newTechnician.save();
            } catch (techError) {
                console.error("Technician save error:", techError);

                if (techError.name === "ValidationError") {
                    console.error("Validation errors:", techError.errors);
                }
                if (techError.code === 11000) {
                    console.error("Duplicate key error:", techError.keyValue);
                }

                await Auth.deleteOne({ _id: savedUser._id });

                return res.status(500).json({
                    message: "Failed to save technician",
                    error: techError.message,
                    details: techError.errors || techError,
                });
            }
        }

        res.status(201).json({
            message: `${role} registered successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// User Login function
const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // First, check if user exists in Auth collection
        let user = await Auth.findOne({ email });

        if (!user) {
            // If not found in Auth, check in User collection (for customer)
            const customer = await User.findOne({ email });

            if (!customer) {
                return res.status(404).json({ message: "User not found. Please register." });
            }

            // Match password
            const isMatch = await bcrypt.compare(password, customer.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Token payload for customer
            const tokenPayload = {
                id: customer._id,
                role: "customer",
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

            return res.status(200).json({
                message: "Login successful as customer",
                token,
                user: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email,
                    role: "customer",
                },
            });
        }

		// Authenticated user in Auth collection (technician, supervisor, etc.)
		if (user.isDisabled) {
			return res
				.status(403)
				.json({ message: "Your account is disabled. Contact support." });
		}
		// Block login if not yet approved
if ((user.role === "technician" || user.role === "supervisor") && !user.isApproved) {
  return res.status(403).json({
    message: "Your account is pending approval by the manager.",
  });
}


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let technicianId = null;
        if (user.role === "technician") {
            const technician = await Technician.findOne({ email: user.email });
            if (!technician) {
                return res.status(404).json({ message: "Technician data not found." });
            }
            technicianId = technician._id;
        }

        const tokenPayload = {
            id: user._id,
            role: user.role,
            ...(technicianId && { technicianId }),
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({
            message: `Login successful as ${user.role}`,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                userName: user.userName,
				phone: user.phone,
                email: user.email,
                role: user.role,
            },
            ...(technicianId && { technicianId }),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const logoutUser = async(req, res) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }
    const token = authHeader.split(" ")[1];
    addToBlacklist(token); // Add token to blacklist
    res.status(200).json({ message: "Logout successful" });
};



// In-memory OTP store (in production, use Redis or DB)
const otpStore = new Map();

// Step 1: Send OTP to email
const sendForgotPasswordOTP = async (req, res) => {
	const { email } = req.body;

	if (!email) return res.status(400).json({ message: "Email is required" });

	const user = await Auth.findOne({ email }) || await User.findOne({ email });
	if (!user) return res.status(404).json({ message: "User not found" });

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

	otpStore.set(email, { otp, expiresAt });

	// Send email with OTP (use your own SMTP config)
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: `"Password Reset" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Your OTP for Password Reset",
		text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: "OTP sent to your email" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to send OTP", error: error.message });
	}
};

// Step 2: Verify OTP and Reset Password
const resetPasswordWithOTP = async (req, res) => {
	const { email, otp, newPassword, confirmPassword } = req.body;

	if (!email || !otp || !newPassword || !confirmPassword) {
		return res.status(400).json({ message: "All fields are required" });
	}
	if (newPassword !== confirmPassword) {
		return res.status(400).json({ message: "Passwords do not match" });
	}
	if (!otpStore.has(email)) {
		return res.status(400).json({ message: "OTP not found or expired" });
	}

	const { otp: storedOtp, expiresAt } = otpStore.get(email);
	if (Date.now() > expiresAt) {
		otpStore.delete(email);
		return res.status(400).json({ message: "OTP expired" });
	}
	if (otp !== storedOtp) {
		return res.status(400).json({ message: "Invalid OTP" });
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	const user = await Auth.findOne({ email }) || await User.findOne({ email });
	if (!user) return res.status(404).json({ message: "User not found" });

	user.password = hashedPassword;
	await user.save();

	otpStore.delete(email);

	res.status(200).json({ message: "Password reset successful" });
};
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Auth.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["technician", "supervisor"].includes(user.role)) {
      return res.status(400).json({ message: "Only technicians or supervisors require approval" });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({ message: `${user.role} approved successfully` });
  } catch (err) {
    res.status(500).json({ message: "Error approving user", error: err.message });
  }
};
const getPendingUsers = async (req, res) => {
  try {
    const pending = await Auth.find({
      isApproved: false,
      rejected: { $ne: true }, // ✅ exclude rejected users
      role: { $in: ["technician", "supervisor"] },
    }).select("_id fullName email role createdAt");

    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending users", error: err.message });
  }
};

 // already used in your project

const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Auth.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["technician", "supervisor"].includes(user.role)) {
      return res.status(400).json({ message: "Only technicians or supervisors can be rejected" });
    }

    // Soft delete: mark as rejected
    user.rejected = true;
    await user.save();

    // If it's a technician, delete the technician record
    if (user.role === "technician") {
      await Technician.deleteOne({ email: user.email });
    }

    // Send rejection email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Garage24 Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Account Rejection - Garage24",
      text: `Dear ${user.fullName},\n\nWe regret to inform you that your registration as a ${user.role} was not approved.\n\nFor any inquiries, please contact support.\n\nBest regards,\nGarage24 Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `${user.role} account has been rejected and marked as inactive.` });
  } catch (err) {
    console.error("Error rejecting user:", err);
    res.status(500).json({ message: "Error rejecting user", error: err.message });
  }
};
// GET /api/auth/profile
const getStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Auth.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};






module.exports = { 
    registerUser, 
	loginUser,
	logoutUser,
	sendForgotPasswordOTP, 
	resetPasswordWithOTP ,
	approveUser , 
	getPendingUsers,
	rejectUser,
    getStaffProfile

};
