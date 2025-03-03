const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

const getUserVehicles = async (req, res) => {
    try {
        const userId = req.params.user_id; 

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        let userObjectId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId
        } catch (error) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Fetch vehicles for the specified user
        const vehicles = await Vehicle.find({ user: userObjectId }).select("vehicleNumber model");
        console.log("Vehicles found:", vehicles);

        if (vehicles.length === 0) {
            console.log("User ID from URL:", userId);
            console.log("Converted User ObjectId:", userObjectId);
            console.log("Vehicles found:", vehicles);
            console.log("Query:", { user: userObjectId });
            return res.status(404).json({ message: "No vehicles found for this user" });
        }

        
        res.json(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getUserVehicles };