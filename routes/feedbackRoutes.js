const express = require("express");
const {
  getFeedbacks,
  addReply,
  updateActionStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

module.exports = router;
