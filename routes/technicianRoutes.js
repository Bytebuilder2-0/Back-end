const express = require("express");
const { createTechnician, getTechnicians } = require("../controllers/technicianController");

const router = express.Router();

// Add a new technician
router.post("/", createTechnician);

// Get all technicians
router.get("/", getTechnicians);

module.exports = router;