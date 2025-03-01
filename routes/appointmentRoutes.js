const express = require("express");
const {
  createAppointment,
  getAppointments,
  updateWorkload,
  suggestionWrite,
  getWorkload,
} = require("../controllers/appointmentController.js");
const { assignTechnician } = require("../controllers/assignTechnician.js");
const { updateAppointmentStatus } = require("../controllers/statusUpdate.js");

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointments);
router.put("/:id/workload", updateWorkload);
router.get("/:id/workload", getWorkload);

router.put("/:appointmentId/assign2", assignTechnician);

router.put("/:appointmentId/statusUpdate", updateAppointmentStatus);
router.put("/:appointmentId/suggestions", suggestionWrite);

module.exports = router;
