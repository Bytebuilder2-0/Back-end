const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

const addVehicle = async(req,res) => {

    try{

    const {vehicleNumber,vehicleYear, model, vehicleType } = req.body;

    if( !vehicleNumber|| !model|| !vehicleType || !vehicleYear){
        return res.status(400).json({ message: "All fields are required......" });
      }

    const currentYear = new Date().getFullYear();

    if (vehicleYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Year must be ${currentYear} or earlier`
      });
    }
    const userId = req.params.user_id;

    const vehicle = new Vehicle({
      user: userId,
      vehicleNumber,
      vehicleYear,
      model,
      vehicleType
    });

    await vehicle.save();
    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};


const getUserVehicles = async (req, res) => {
    try {
        const userId = req.params.user_id; 

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        let userObjectId;
        try {
            userObjectId = new mongoose.Types.ObjectId(userId);           // Convert to ObjectId
        } catch (error) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const vehicles = await Vehicle.find({ user: userObjectId }).select("vehicleNumber model");            // Fetch vehicles for the specified user
        console.log("Vehicles found:", vehicles);

        if (vehicles.length === 0) {
            console.log("User ID from URL:", userId);
            console.log("Vehicles found:", vehicles);
            return res.status(404).json({ message: "No vehicles found for this user" });
        }
            
        res.json(vehicles);

        
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ error: "Server error" });
    }
};
//user can delete a vehicle
const deleteVehicle = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const vehicleId = req.params.vehicle_id;

    const vehicle = await Vehicle.findOneAndDelete({
      _id: vehicleId,
      user: userId,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found or not authorized" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//user can retrieve a specific vehicle's detail
const getVehicleById = async (req, res) => {
  try {
    const { user_id, vehicle_id } = req.params;

    const vehicle = await Vehicle.findOne({ _id: vehicle_id, user: user_id });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};





module.exports = { getUserVehicles,addVehicle, deleteVehicle, getVehicleById };