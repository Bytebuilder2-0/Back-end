const express = require("express");
const {
    createAppointment,
    getAppointments,
    getUserAppointments,
    updateWorkload,
    suggestionWrite,
    getWorkload,
    fetchApppintmetDetails,
    getAssigned
} = require("../controllers/appointmentController.js");
const { authMiddleware } = require("../middlewares/userAuthMiddleware.js");
const { getServices } = require("../controllers/serviceController");
const { getUserVehicles } = require("../controllers/vehicleController");
const { assignTechnician } = require("../controllers/assignTechnician.js");
const { updateAppointmentStatus } = require("../controllers/statusUpdate.js");

const router = express.Router();

router.post("/:user_id", createAppointment);
router.get("/user/:userId", getUserAppointments);
router.get("/services", getServices);
router.get("/:appointment_id", fetchApppintmetDetails); //Fetch detail of a specific appointment


router.get("/vehicles/:user_id", getUserVehicles);

router.get("/", getAppointments); //fetch all appointments to supervisor dashboard
router.put("/:id/workload", updateWorkload);
router.get("/:id/workload", getWorkload);
//me
router.get("/completed", getAssigned);


router.put("/:appointmentId/assign2", assignTechnician);

router.put("/:appointmentId/statusUpdate", updateAppointmentStatus);
router.put("/:appointmentId/suggestions", suggestionWrite);

module.exports = router;