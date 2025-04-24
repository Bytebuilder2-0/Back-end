const express = require("express");
const {
  getFeedbacks,
  addReply,
  updateActionStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");
// feedback model v1

const router = express.Router();

router.get("/", getFeedbacks);
router.put("/:id/reply", addReply);
router.put("/:id/action", updateActionStatus);
router.put("/:id/delete", deleteFeedback); // Soft delete route

module.exports = router;
