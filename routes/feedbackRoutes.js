const express = require("express");
const {
  getFeedbacks,
  addReply,
  submitFeedback,
  updateActionStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");
// feedback model

const router = express.Router();

router.post("/submit", submitFeedback);
router.get("/", getFeedbacks);
router.put("/:id/reply", addReply);
router.put("/:id/action", updateActionStatus);
router.put("/:id/delete", deleteFeedback); // Soft delete route

module.exports = router;
