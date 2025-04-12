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
