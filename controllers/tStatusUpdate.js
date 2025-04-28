const Appointment = require("../models/Appointment");

// Update the status (and optionally reason) of the appointment
const tStatusUpdate = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status, reason }, // ✅ Update both status and reason together
      { new: true } // ✅ Return the updated document
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

module.exports = { tStatusUpdate };
