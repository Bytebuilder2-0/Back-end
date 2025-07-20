const express = require("express");
const { getSupervisorDetails } = require("../controllers/getSupervisorDetails");
const router = express.Router();

router.get("/:id", getSupervisorDetails);

module.exports = router;
