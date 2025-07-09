const Auth = require("../models/auth.js"); // Import your model
const Technician = require("../models/Technician.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { addToBlacklist } = require("../utils/blacklist.js"); // Import the blacklist utility

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

        const existingUser = await Auth.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // 2. For technicians: validate required technician fields
        // if (role === "technician") {
        // 	if (!employee_id) {
        // 		return res
        // 			.status(400)
        // 			.json({ message: "Employee ID is required for technicians" });
        // 	}
        // }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save to Auth collection (main user)
        const newUser = new Auth({
            email,
            fullName,
            userName,
            phone,
            password: hashedPassword,
            role,
        });
        const savedUser = await newUser.save();

        // 5. If technician, save to Technician collection too
        if (role === "technician") {
            const generateRandomEmployeeId = () => {
                return `TECH-${Math.floor(10000 + Math.random() * 90000)}`;
            };

            let generatedEmployeeId = generateRandomEmployeeId();

            // Optional: check DB to avoid duplicates (recommended)
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
                console.log("Technician document before save:", newTechnician);
                await newTechnician.save();
                console.log("Technician saved successfully");
            } catch (techError) {
                console.error("Technician save error:", techError);

                // Specific error handling
                if (techError.name === "ValidationError") {
                    console.error("Validation errors:", techError.errors);
                }
                if (techError.code === 11000) {
                    console.error("Duplicate key error:", techError.keyValue);
                }

                // Rollback user creation
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

        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please register." });
        }

        if (user.isDisabled) {
            return res.status(403).json({ message: "Your account is disabled. Contact support." });
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
            technicianId = technician._id; // ✅ Technician MongoDB _id
        }

        // ✅ Token payload with both IDs
        const tokenPayload = {
            id: user._id, // Main user MongoDB _id
            role: user.role,
            ...(technicianId && { technicianId: technicianId }), // include only if role is technician
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({
            message: `Login successful as ${user.role}`,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                role: user.role,
            },
            ...(technicianId && { technicianId }), // Optional: send for frontend use
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

module.exports = { registerUser, loginUser, logoutUser };