const express = require("express");
const { getAllServices } = require("../controllers/serviceControllerManage");

const router = express.Router();

// Fetch all services
router.get("/", getAllServices);

module.exports = router;
