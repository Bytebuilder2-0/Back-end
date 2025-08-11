const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({

    technician_id: { type: String, required: true, unique: true },

    employee_id: {
        type: String,
        unique: true,
        required: true,
    },
    department: { type: String, default: "General" },

    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Auto-adds createdAt & updatedAt

const Technician = mongoose.model("Technician", technicianSchema);

module.exports = Technician;