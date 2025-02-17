const express = require("express");
const { createAppointment, getAppointments, updateWorkload } = require("../controllers/appointmentController.js");
const { assignTechnician } = require("../controllers/assignTechnician.js");
const { updateAppointmentStatus } = require("../controllers/statusUpdate.js");

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointments);
router.put("/:id/workload", updateWorkload);

router.put("/:appointmentId/assign", assignTechnician);

router.put("/:appointmentId/statusUpdate", updateAppointmentStatus);


module.exports = router;