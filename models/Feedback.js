const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  feedbackId: { type: String, required: true },
  feedbackDate: { type: Date, required: true },
  comment: { type: String, required: true },
  actionStatus: { type: String, enum: ["yes", "no"], default: "no" },
  reply: { type: String, default: "" },
  deleted: { type: Boolean, default: false }, // Soft delete flag
});

module.exports = mongoose.model("Feedback", feedbackSchema);
