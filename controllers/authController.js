const Auth = require("../models/auth.js"); // Import your model
const Technician = require("../models/Technician.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { addToBlacklist } = require("../utils/blacklist.js"); // Import the blacklist utility
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 10;

// User Registration with Role-based access
const registerUser = async (req, res) => {
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

const loginUser = async (req, res) => {
	try {
		const { email, password, otp } = req.body;

		if (!email || (!password && !otp)) {
			return res.status(400).json({ message: "Email and password or OTP are required" });
		}

		let user = await Auth.findOne({ email }) || await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: "User not found. Please register." });
		}

		// ✅ Check if account is locked and trying OTP login
		if (user.isLocked) {
			if (!otp) {
				return res.status(403).json({ message: "Account is locked. Check email for OTP." });
			}
			if (otp !== user.unlockOtp || Date.now() > user.unlockOtpExpires) {
				return res.status(400).json({ message: "Invalid or expired OTP" });
			}

			user.isLocked = false;
			user.failedLoginAttempts = 0;
			user.unlockOtp = undefined;
			user.unlockOtpExpires = undefined;
			user.mustChangePassword = true;
			await user.save();

			const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
			return res.status(200).json({
				message: "OTP verified. Account unlocked.",
				token,
				user: {
					id: user._id,
					email: user.email,
					role: user.role,
					mustChangePassword: true,
				},
			});
		}

		// ✅ Normal login flow (password-based)
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

			if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
				user.isLocked = true;

				const otp = Math.floor(100000 + Math.random() * 900000).toString();
				user.unlockOtp = otp;
				user.unlockOtpExpires = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

				await sendOtpEmail(user.email, otp);
				await user.save();

				return res.status(403).json({ message: "Account locked. OTP sent to email." });
			}

			await user.save();
			return res.status(400).json({ message: "Invalid email or password" });
		}

		// ✅ Password matched — reset failed attempts
		user.failedLoginAttempts = 0;
		await user.save();

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

		return res.status(200).json({
			message: `Login successful as ${user.role}`,
			token,
			user: {
				id: user._id,
				fullName: user.fullName || user.name,
				userName: user.userName,
				phone: user.phone,
				email: user.email,
				role: user.role,
				mustChangePassword: user.mustChangePassword || false
			},
			...(technicianId && { technicianId }),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};


const logoutUser = async (req, res) => {
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
const sendOtpEmail = async (toEmail, otp) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: `"Account Unlock" <${process.env.EMAIL_USER}>`,
		to: toEmail,
		subject: "Your OTP to Unlock Account",
		text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
	};

	await transporter.sendMail(mailOptions);
};


module.exports = { registerUser, loginUser, logoutUser, sendForgotPasswordOTP, resetPasswordWithOTP, sendOtpEmail };
