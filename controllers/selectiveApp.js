const Appointment = require('../models/Appointment');

// Confirm appointment by supervisor
const confirmAppointmentBySupervisor = async(req, res) => {
    try {
        const { appointmentId } = req.params;
        const { supervisorId } = req.body;

        if (!supervisorId) {
            return res.status(400).json({ message: "Supervisor ID is required" });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId, { sconfirmedBy: supervisorId }, { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({ message: "Supervisor confirmed appointment", appointment: updatedAppointment });
    } catch (error) {
        console.error("Error confirming supervisor:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    confirmAppointmentBySupervisor,
};