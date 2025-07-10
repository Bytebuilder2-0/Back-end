const Auth = require("../models/auth.js"); // Import your model
const Technician = require("../models/Technician.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { addToBlacklist } = require("../utils/blacklist.js"); // Import the blacklist utility

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

const logoutUser = async (req, res) => {
	const authHeader = req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Authorization token is missing" });
	}
	const token = authHeader.split(" ")[1];
	addToBlacklist(token); // Add token to blacklist
	res.status(200).json({ message: "Logout successful" });
};

module.exports = { registerUser, loginUser, logoutUser };
