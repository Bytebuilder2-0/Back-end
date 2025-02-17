const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({
    technician_id: { type: String, required: true, unique: true }, // Unique Technician ID
    employee_id: { type: String, required: true }, // Employee ID
    department: { type: String, required: true } // Department (e.g., Engine, Electrical, Bodywork)
}, { timestamps: true }); // Auto-adds createdAt & updatedAt

const Technician = mongoose.model("Technician", technicianSchema);

module.exports = Technician;