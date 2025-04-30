const Appointment = require("../models/Appointment");

const setReason = async (req, res) => {
	const { reason } = req.body;
	try {
		const appointment = await Appointment.findById(req.params.app_id);
		if (!appointment) {
			return res.status(404).json({ message: "Appointment not found" });
		}
		appointment.reason = reason; // setting reason
		await appointment.save(); // saving changes
		res.status(200).json({ message: "Reason updated successfully", reason: appointment.reason });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	setReason,
};
