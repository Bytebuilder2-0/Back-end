const express = require("express");
const {
  getAllServices,
  addService,
  updateService,
  toggleService,
  deleteService,
} = require("../controllers/serviceControllerManage");

const router = express.Router();

// Fetch all services
router.get("/", getAllServices);

// Add a new service
router.post("/", addService);

//update a new service

router.put("/update/:id", updateService);

// update service status
router.put("/:id", toggleService);

// Delete a service
router.delete("/:id", deleteService);

module.exports = router;
