const mongoose = require("mongoose");
const Technician = require("../models/Technician"); // ✅ Make sure the path is correct
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Technician Login Controller
const loginTechnician = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const technician = await Technician.findOne({ email });
		if (!technician) {
			return res.status(404).json({ message: "Technician not found" });
		}

		const isMatch = await bcrypt.compare(password, technician.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		const token = jwt.sign(
			{ id: technician._id, role: "technician" },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		res.status(200).json({
			message: "Technician login successful",
			token,
			technician: {
				id: technician._id,
				fullName: technician.fullName,
				userName: technician.userName,
				department: technician.department,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};

// ✅ Export the function
module.exports = { loginTechnician };
