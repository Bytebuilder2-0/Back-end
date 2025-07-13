const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

// Add vehicle
router.post("/:user_id", vehicleController.addVehicle);

// Get all vehicles for a user
router.get("/:user_id", vehicleController.getUserVehicles);

// Delete a vehicle
router.delete("/:user_id/:vehicle_id", vehicleController.deleteVehicle);

// Get a single vehicle's details
router.get("/:user_id/:vehicle_id", vehicleController.getVehicleById);

module.exports = router;
