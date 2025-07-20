const Auth = require("../models/auth");

const getSupervisorDetails = async (req, res) => {
	try {
		const supervisor = await Auth.findById(req.params.id).select(
			"userName email phone role"
		);
		if (!supervisor) {
			return res.status(404).json({ message: "Supervisor not found" });
		}
		res.status(200).json(supervisor);
	} catch (error) {
		console.error("Error fetching supervisor:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

module.exports = { getSupervisorDetails };
