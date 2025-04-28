// routes/serviceManageRoutes.js
const express = require("express");
const {
  getServices,
  setServices,
  toggleService,
  deleteService,
  updateService,
} = require("../controllers/serviceControllerManage");

const router = express.Router();

// Fetch all services
router.get("/", getServices);

// Add a new service
router.post("/", setServices);

// Toggle service selected status
router.put("/:id", toggleService); // Update selected field of the service

// Update service name
router.put("/update/:id", updateService); // Update service name

// Delete a service
router.delete("/:id", deleteService); // Delete a service by ID

module.exports = router;
