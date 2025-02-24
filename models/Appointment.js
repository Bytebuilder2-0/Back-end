const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
        vehicleId: { type: String, required: true },
        vehicleNumber: { type: String, required: true },
        model: { type: String, required: true },
        issue: { type: String, required: true },
        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed", "Reject1",
                "Waiting for Technician Confirmation",
                "Accepted", "Reject2",
                "Task Done",
                "Paid",
                "Completed"
            ],
            default: "Pending"
        },
        workload: { type: String, default: "123" },
        tech: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Technician", //model name not the collection name
            default: null,
        },
        techMessage: { type: String, default: null },
        suggestion: { type: String, default: null }
    }, { timestamps: true } // Auto-adds createdAt & updatedAt
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;