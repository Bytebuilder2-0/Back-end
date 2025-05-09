const Appointment = require("../models/Appointment");

// Update the status (and optionally reason) of the appointment
const supervisedBy = async(req, res) => {
    try {
        const { sconfirmedBy } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.appointmentId, {
                sconfirmedBy
            }, { new: true } // ✅ Return the updated document
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

module.exports = { supervisedBy };