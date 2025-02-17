const Appointment = require("../models/Appointment.js");
const mongoose = require("mongoose");

const assignTechnician = async(req, res) => {
    const { technicianId } = req.body; // Get technicianId from request body --not the actual id ,mongoDB ID ref
    const { appointmentId } = req.params; // Get appointmentId from request params

    // Validate if the appointmentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId, { tech: technicianId }, // Assign the technician
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Successfully updated the appointment with technician
        res.status(200).json(updatedAppointment);
    } catch (error) {
        console.error("Error:", error); // Log error for debugging
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { assignTechnician };