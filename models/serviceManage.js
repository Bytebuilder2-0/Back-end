// models/serviceManage.js
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Service name
  selected: { type: Boolean, default: false }, // Whether the service is active
  description: { type: String, required: false }, // Optional description of the service
});

const ServiceManage = mongoose.model("ServiceManagesnew", serviceSchema);

module.exports = ServiceManage;
