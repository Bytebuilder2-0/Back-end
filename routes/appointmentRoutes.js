const express = require("express");
const {
  createAppointment,
  getAppointments,
  updateWorkload,
  suggestionWrite,
  getWorkload,
  fetchApppintmetDetails
} = require("../controllers/appointmentController.js");
const {authMiddleware} = require("../middlewares/userAuthMiddleware.js"); 
const {  getServices } = require("../controllers/serviceController");
const { getUserVehicles } = require("../controllers/vehicleController");
const { assignTechnician } = require("../controllers/assignTechnician.js");
const { updateAppointmentStatus } = require("../controllers/statusUpdate.js");

const router = express.Router();

router.post("/:user_id", createAppointment);
router.get("/services", getServices); 
router.get("/:appointment_id", fetchApppintmetDetails); 

router.get("/vehicles/:user_id", getUserVehicles); 

router.get("/", getAppointments);
router.put("/:id/workload", updateWorkload);
router.get("/:id/workload", getWorkload);

router.put("/:appointmentId/assign2", assignTechnician);

router.put("/:appointmentId/statusUpdate", updateAppointmentStatus);
router.put("/:appointmentId/suggestions", suggestionWrite);

module.exports = router;
