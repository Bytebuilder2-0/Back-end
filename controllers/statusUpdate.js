const Appointment = require("../models/Appointment");
const {
  createNotification,
  notifyAllManagers,
  notifyAllSupervisors,
} = require("./notificationController");

//update the status of the appointmnet according to the activity done for the specific appointent,resulting update or delete the appointmnet
const updateAppointmentStatus = async (req, res) => {
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
        deletedAppointment._id,
        req
      );

      return res.json({
        message: "Appointment rejected and deleted successfully",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status },
      { new: true }
    ).populate("sconfirmedBy", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Notify customer based on status change
    let notificationMessage = "";
    let notificationType = "general";

    switch (status) {
      case "Pending":
        notificationMessage = `Your appointment for ${appointment.vehicleNumber} has been confirmed by the manager`;
        notificationType = "appointment_approved";

        // Notify all supervisors about new pending appointment
        await notifyAllSupervisors(
          `New appointment available for ${appointment.vehicleNumber} (${appointment.model})`,
          "new_appointment",
          appointment._id,
          req
        );
        break;
      case "Confirmed":
        notificationMessage = `Your appointment for ${
          appointment.vehicleNumber
        } has been assigned to supervisor ${
          appointment.sconfirmedBy?.name || "a supervisor"
        }`;
        notificationType = "appointment_approved";

        // Notify manager that supervisor took responsibility
        await notifyAllManagers(
          `Supervisor ${
            appointment.sconfirmedBy?.name || "Unknown"
          } has taken responsibility for appointment ${
            appointment.vehicleNumber
          }`,
          "appointment_approved",
          appointment._id,
          req
        );
        break;
      case "Cancelled":
        notificationMessage = `Your appointment for ${appointment.vehicleNumber} has been cancelled`;
        notificationType = "appointment_cancelled";

        // Notify manager about cancellation
        await notifyAllManagers(
          `Appointment ${appointment.vehicleNumber} has been cancelled`,
          "appointment_cancelled",
          appointment._id,
          req
        );
        break;
      case "Waiting for Technician Confirmation":
        notificationMessage = `Your appointment for ${appointment.vehicleNumber} is waiting for technician confirmation`;
        notificationType = "general";

        // Notify manager
        await notifyAllManagers(
          `Appointment ${appointment.vehicleNumber} is awaiting technician confirmation`,
          "general",
          appointment._id,
          req
        );
        break;
      case "Accepted":
        notificationMessage = `Technician has accepted your appointment for ${appointment.vehicleNumber}`;
        notificationType = "appointment_approved";

        // Notify manager
        await notifyAllManagers(
          `Technician accepted appointment ${appointment.vehicleNumber}`,
          "appointment_approved",
          appointment._id,
          req
        );
        break;
      case "Reject2":
        notificationMessage = `Technician has declined your appointment for ${appointment.vehicleNumber}`;
        notificationType = "appointment_rejected";

        // Notify manager
        await notifyAllManagers(
          `Technician rejected appointment ${appointment.vehicleNumber}`,
          "appointment_rejected",
          appointment._id,
          req
        );
        break;
      case "InProgress":
        notificationMessage = `Work has started on your vehicle ${appointment.vehicleNumber}`;
        notificationType = "work_started";

        // Notify manager
        await notifyAllManagers(
          `Work started on appointment ${appointment.vehicleNumber}`,
          "work_started",
          appointment._id,
          req
        );
        break;
      case "Task Done":
        notificationMessage = `Work completed on your vehicle ${appointment.vehicleNumber}. Payment is pending.`;
        notificationType = "work_completed";

        // Notify manager
        await notifyAllManagers(
          `Work completed on appointment ${appointment.vehicleNumber}. Awaiting payment.`,
          "work_completed",
          appointment._id,
          req
        );
        break;
      case "Paid":
        notificationMessage = `Payment received for ${appointment.vehicleNumber}. Thank you!`;
        notificationType = "payment_pending";

        // Notify manager
        await notifyAllManagers(
          `Payment received for appointment ${appointment.vehicleNumber}`,
          "payment_pending",
          appointment._id,
          req
        );
        break;
      case "All done":
        notificationMessage = `Your service for ${appointment.vehicleNumber} is complete. Thank you for your feedback!`;
        notificationType = "general";

        // Notify manager
        await notifyAllManagers(
          `Appointment ${appointment.vehicleNumber} is fully completed`,
          "general",
          appointment._id,
          req
        );
        break;
    }

    if (notificationMessage) {
      await createNotification(
        appointment.userId,
        "customer",
        notificationMessage,
        notificationType,
        appointment._id,
        req
      );
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateAppointmentStatus };
