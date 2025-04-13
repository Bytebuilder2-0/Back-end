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

router.put("/update/:id", updateService);

// Toggle service selection (update selected state)
router.put("/:id", toggleService);

// Delete a service
router.delete("/:id", deleteService);

module.exports = router;
