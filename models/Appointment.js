const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },

        vehicleId: { type: String, default: "1234" },
        vehicleObject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle", // Reference to the Vehicle model
            required: true,
        },
        appointmentId: { type: String, default: "123D" },
        vehicleNumber: { type: String, required: true },
        model: { type: String, required: true },
        issue: { type: String, required: true },
        reason: { type: String, default: null}, //meeeeeeeee
        status: {
            type: String,
            enum: [
                "Pending", //initial deafult status
                "Cancelled", //customer cancelling the appintment
                "Confirmed", //intial confirmation by the supervisor
                "Reject1", //reject by the supervisor
                "Waiting for Technician Confirmation", //tech confirmation waiting
                "Accepted", //tech accepted
                "Reject2", //tech rejected
                "InProgress", //task is started 
                "Task Done", //task completed by tech
                "Paid", //money paid by the customer
                "All done" //submit feedback and appoitment process completed
            ],
            default: "Pending",
        },
        workload: [{
            step: { type: Number, required: true }, // Numbering each task
            description: { type: String, required: true }, // Task details
            status: {
                type: String,
                enum: ["Pending", "In Progress", "Completed"],
                default: "Pending",
            }, // Optional
        }, ],
        services: [{
            type: String,
            required: true,
        }, ],
        preferredDate: { type: Date, required: true },
        preferredTime: { type: String, required: true },
        expectedDeliveryDate: { type: Date, required: true },
        
        tech: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Technician", //model name not the collection name
            default: null,
        },
        techMessage: { type: String, default: null },
        suggestion: { type: String, default: null },
        contactNumber: { type: String },

        budgetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Budget",
            default: null,
        },
        payment: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending",
        },

    }, { timestamps: true } // Auto-adds createdAt & updatedAt
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;