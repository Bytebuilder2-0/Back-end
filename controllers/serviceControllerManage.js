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
exports.toggleService = async (req, res) => {
  try {
    const updatedService = await ServiceManage.findByIdAndUpdate(
      req.params.id,
      { selected: req.body.selected },
      { new: true }
    );
    res.status(200).json(updatedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    await ServiceManage.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
