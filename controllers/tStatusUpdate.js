const Appointment = require("../models/Appointment");
const { createNotification } = require("./notificationController");

// Update the status (and optionally reason) of the appointment
const tStatusUpdate = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status, reason }, // ✅ Update both status and reason together
      { new: true } // ✅ Return the updated document
    ).populate("sconfirmedBy", "_id");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Notify supervisor about technician's action
    if (appointment.sconfirmedBy) {
      let message = "";
      let notificationType = "general";

      if (status === "Reject2") {
        message = `Technician rejected appointment for vehicle ${appointment.vehicleNumber}. Reason: ${reason || "Not specified"}`;
        notificationType = "appointment_rejected";
      } else if (status === "Accepted") {
        message = `Technician accepted appointment for vehicle ${appointment.vehicleNumber}`;
        notificationType = "appointment_approved";
      } else if (status === "InProgress") {
        message = `Work started on vehicle ${appointment.vehicleNumber}`;
        notificationType = "work_started";
      } else if (status === "Task Done") {
        message = `Work completed on vehicle ${appointment.vehicleNumber}`;
        notificationType = "work_completed";
      }

      if (message) {
        await createNotification(
          appointment.sconfirmedBy._id,
          "supervisor",
          message,
          notificationType,
          appointment._id,
          req
        );
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { tStatusUpdate };
