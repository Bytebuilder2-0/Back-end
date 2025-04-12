const ServiceManage = require("../models/serviceManage");

// Fetch all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await ServiceManage.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a new service
exports.addService = async (req, res) => {
  try {
    const { name, type } = req.body;
    const newService = new ServiceManage({ name, type });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Toggle the selection state of a service
