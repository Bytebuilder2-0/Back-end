// controllers/serviceController.js
const ServiceManage = require("../models/serviceManage");

// Create a new service
exports.setServices = async (req, res) => {
  try {
    const { name } = req.body; // Assuming we only send name

    // Check if the service already exists (optional, if you want to prevent duplicates)
    const existingService = await ServiceManage.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: "Service already exists." });
    }

    // Create new service
    const newService = new ServiceManage({
      name,
      selected: false, // or any default value you need
    });

    // Save the service to the database
    await newService.save();

    // Return the created service
    res.status(201).json(newService); // Send back the new service with its _id and other details
  } catch (error) {
    console.error("Error adding service:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all services
exports.getServices = async (req, res) => {
  try {
    const services = await ServiceManage.find({}); // Fetch all services from the database
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle service selected status
exports.toggleService = async (req, res) => {
  try {
    const updatedService = await ServiceManage.findByIdAndUpdate(
      req.params.id,
      { selected: req.body.selected },
      { new: true } // Return the updated service
    );
    res.status(200).json(updatedService); // Send back the updated service
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    await ServiceManage.findByIdAndDelete(req.params.id); // Delete the service by ID
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a service name
exports.updateService = async (req, res) => {
  try {
    const { name } = req.body; // Get updated name from request body
    const updatedService = await ServiceManage.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true } // Return the updated service
    );
    res.status(200).json(updatedService); // Send back the updated service
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
