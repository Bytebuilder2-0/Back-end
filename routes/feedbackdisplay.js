const express = require("express");
const { getFeedbacks } = require("../controllers/feedBackDisplay");
const router = express.Router();

router.get("/", getFeedbacks);

module.exports = router;
