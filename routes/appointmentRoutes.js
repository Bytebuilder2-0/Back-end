const express = require("express");
const {
	createAppointment,
	getAppointments,
	getUserAppointments,
	updateWorkload,
	suggestionWrite,
	getWorkload,
	fetchApppintmetDetails,
	getAssigned,
	getCount,
	upadateWorkloadStatus,
} = require("../controllers/appointmentController.js");

const { getServices } = require("../controllers/serviceController");
const { getUserVehicles } = require("../controllers/vehicleController");
const { assignTechnician } = require("../controllers/assignTechnician.js");
const { updateAppointmentStatus } = require("../controllers/statusUpdate.js");
const { tStatusUpdate } = require("../controllers/TStatusUpdate.js");
const { tSuggestionWrite } = require("../controllers/tSuggestionWrite.js");
const { getTechMessage } = require("../controllers/appointmentController.js");
const { setReason } = require("../controllers/reasonSet.js");

const router = express.Router();

router.post("/:user_id", createAppointment);

router.get("/statusCounts", getCount);
router.get("/user/:userId", getUserAppointments);
router.get("/services", getServices);
router.get("/:appointment_id", fetchApppintmetDetails);
router.get("/vehicles/:user_id", getUserVehicles);
//fetch all appointments to supervisor dashboard
router.get("/", getAppointments);
router.get("/:id/workload", getWorkload);
router.get("/:id/techMessage", getTechMessage);
router.get("/completed", getAssigned);

router.put("/:id/workload", updateWorkload);
router.put("/:appointmentId/assign2", assignTechnician);
router.put("/:appointmentId/statusUpdate", updateAppointmentStatus);
router.put("/:appointmentId/tStatusUpdate", tStatusUpdate);
router.put("/:appointmentId/tSuggestionWrite", tSuggestionWrite);
router.put("/:appointmentId/suggestions", suggestionWrite);
router.put("/:appointmentId/workload/:taskId", upadateWorkloadStatus);
router.put("/:app_id/reason", setReason);

module.exports = router;
