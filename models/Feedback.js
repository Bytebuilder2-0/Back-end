const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  feedbackId: {
    type: String,
    unique: true,
  },
  /* user: { type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true }, */

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: false },
  feedbackDate: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
    default: "",
  },
  actionStatus: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  reply: {
    type: String,
    default: "",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

// Pre-save hook to generate feedback ID
feedbackSchema.pre("save", async function (next) {
  if (!this.feedbackId) {
    try {
      const count = await this.constructor.countDocuments();
      this.feedbackId = `FB${String(count + 1).padStart(5, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
