const express = require("express");
const {  getAppointments, updateWorkload, suggestionWrite } = require("../controllers/appointmentController.js");
const { createAppointment } = require("../controllers/createAppoinment.js");
const {authMiddleware} = require("../middlewares/userAuthMiddleware.js"); 
const {  getServices } = require("../controllers/serviceController");
const { getUserVehicles } = require("../controllers/vehicleController");
const { assignTechnician } = require("../controllers/assignTechnician.js");
const { updateAppointmentStatus } = require("../controllers/statusUpdate.js");

const router = express.Router();

router.post("/", authMiddleware, createAppointment);
router.get("/services", getServices); 
router.get("/vehicles/:user_id", getUserVehicles); 

router.get("/", getAppointments);
router.put("/:id/workload", updateWorkload);

router.put("/:appointmentId/assign", assignTechnician);

router.put("/:appointmentId/statusUpdate", updateAppointmentStatus);
router.put("/:appointmentId/suggestions", suggestionWrite);
module.exports = router;