const User = require("../models/User");
const Vehicle = require("../models/Vehicle")
const bcrypt = require("bcrypt");

const registerUser = async(req, res) => {
    try {
        const { name, email, password, vehicles } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save the user
        const savedUser = await newUser.save();

        if (vehicles) {

            for (const vehicle of vehicles) {
                const { model, vehicleNumber, vehicleType } = vehicle;

                const newVehicle = new Vehicle({
                    user: savedUser._id, // Link vehicle to user
                    model,
                    vehicleNumber,
                    vehicleType
                });

            await newVehicle.save();
        }
    }

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { registerUser };