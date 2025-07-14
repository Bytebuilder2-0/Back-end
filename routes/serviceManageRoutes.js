// routes/serviceManageRoutes.js
const express = require("express");
const {
  viewServices,
  addServices,
  toggleService,
  deleteService,
  updateService,
  updateServiceSteps,
} = require("../controllers/serviceController");

const router = express.Router();

// Fetch all services
router.get("/", viewServices);

// Add a new service
router.post("/", addServices);

// Toggle service selected status
router.put("/:id", toggleService); // Update selected field of the service

// Update service name
router.put("/update/:id", updateService); // Update service name

// Delete a service
router.delete("/:id", deleteService); // Delete a service by ID
//add step
router.put("/steps/:id", updateServiceSteps);

module.exports = router;
