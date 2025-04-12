const express = require("express");
const {
  getAllServices,
  addService,
  updateService,
  toggleService,
} = require("../controllers/serviceControllerManage");

const router = express.Router();

// Fetch all services
router.get("/", getAllServices);

// Add a new service
router.post("/", addService);

router.put("/update/:id", updateService);

// Toggle service selection (update selected state)
router.put("/:id", toggleService);

module.exports = router;
