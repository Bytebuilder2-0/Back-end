const Appointment = require("../models/Appointment");
const { createNotification } = require("./notificationController");


//update the status of the appointmnet according to the activity done for the specific appointent,resulting update or delete the appointmnet
const updateAppointmentStatus = async(req, res) => {
    try {
        const { status } = req.body;

        if (status === "Reject1") {
            const deletedAppointment = await Appointment.findByIdAndDelete(
                req.params.appointmentId
            );
            if (!deletedAppointment) {
                return res, status(404).json({ message: "Appointment Not Found" });
            }

            // Notify customer about rejection
            await createNotification(
                deletedAppointment.userId,
                "customer",
                `Your appointment for ${deletedAppointment.vehicleNumber} has been rejected by the manager`,
                "appointment_rejected",
                deletedAppointment._id
            );

            return res.json({
                message: "Appointment rejected and deleted successfully",
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.appointmentId, { status }, { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Notify customer based on status change
        let notificationMessage = "";
        let notificationType = "general";

        switch (status) {
            case "Confirmed":
                notificationMessage = `Your appointment for ${appointment.vehicleNumber} has been confirmed by the manager`;
                notificationType = "appointment_approved";
                break;
            case "Cancelled":
                notificationMessage = `Your appointment for ${appointment.vehicleNumber} has been cancelled`;
                notificationType = "appointment_cancelled";
                break;
            case "InProgress":
                notificationMessage = `Work has started on your vehicle ${appointment.vehicleNumber}`;
                notificationType = "work_started";
                break;
            case "Task Done":
                notificationMessage = `Work completed on your vehicle ${appointment.vehicleNumber}. Payment is pending.`;
                notificationType = "work_completed";
                break;
            case "Paid":
                notificationMessage = `Payment received for ${appointment.vehicleNumber}. Thank you!`;
                notificationType = "payment_pending";
                break;
        }

        if (notificationMessage) {
            await createNotification(
                appointment.userId,
                "customer",
                notificationMessage,
                notificationType,
                appointment._id
            );
        }

        res.json(appointment);
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { updateAppointmentStatus };