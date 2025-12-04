const Appointment = require("../models/Appointment");
const { createNotification } = require("./notificationController");

// Update the status (and optionally reason) of the appointment
const tSuggestionWrite = async (req, res) => {
  try {
    const { techMessage } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { techMessage }, // ✅ Update techMessage together
      { new: true } // ✅ Return the updated document
    ).populate("userId", "_id");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Notify customer about manager's reply message
    if (appointment.userId && techMessage) {
      await createNotification(
        appointment.userId._id,
        "customer",
        `New message from manager regarding your appointment for vehicle ${appointment.vehicleNumber}`,
        "general",
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

module.exports = { tSuggestionWrite };
