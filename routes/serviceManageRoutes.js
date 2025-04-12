const express = require("express");
const {
  getAllServices,
  addService,
} = require("../controllers/serviceControllerManage");

const router = express.Router();

// Fetch all services
router.get("/", getAllServices);

// Add a new service
router.post("/", addService);

module.exports = router;
