const express = require("express");
const {
  getAllServices,
  addService,
  updateService,
} = require("../controllers/serviceControllerManage");

const router = express.Router();

// Fetch all services
router.get("/", getAllServices);

// Add a new service
router.post("/", addService);

router.put("/update/:id", updateService);

module.exports = router;
