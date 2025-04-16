const Appointment = require("../models/Appointment");

//update the status of the appointmnet according to the activity done for the specific appointent

const updateAppointmentStatus = async(req, res) => {
    try {
        const { status } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.appointmentId, { status }, { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json(appointment);
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { updateAppointmentStatus };