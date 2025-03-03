const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle", // Reference to the Vehicle model
        required: true
    },

        vehicleNumber: { type: String, required: true },
        model: { type: String, required: true },
        issue: { type: String, required: false  },    
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
         services: [{ 
        type: String, 
        enum: ["A/C repair", "Oil repair", "Break Services"], 
        required: true 
    }],
        preferredTime: { type: String, required: true },
        expectedDeliveryDate: { type: Date, required: true },
        
        workload: { type: String, default: "123" },
        tech: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Technician", //model name not the collection name
            default: null,
        },
        techMessage: { type: String, default: null },
        suggestion: { type: String, default: null },
        contactNumber: { type: String }
    }, { timestamps: true } // Auto-adds createdAt & updatedAt
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;