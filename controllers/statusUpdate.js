const Appointment = require("../models/Appointment");

//update the status of the appointmnet according to the activity done for the specific appointent..resulting update or delete the appointmnet

const updateAppointmentStatus = async(req, res) => {
    try {
        const { status } = req.body;

        if (status === "reject1") {
            const deletedAppointment = await Appointment.findByIdAndDelete(req.params.appointmentId);
            if (!deletedAppointment) {
                return res, status(404).json({ message: "Appointment Not Found" });
            }
            return res.json({ message: "Appointment rejected and deleted successfully" });
        }
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