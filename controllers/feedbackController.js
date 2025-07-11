const Feedback = require("../models/Feedback");

//  Fetch feedbacks (excluding deleted)  for manager
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      deleted: false,
      comment: { $ne: "" }, // $ne means "not equal"
    });
    res.status(200).json({ message: "Fetched successfully!", data: feedbacks });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const submitFeedback = async (req, res) => {
  try {
    const { appointmentId, comment } = req.body;

    // Validate input
    if (!appointmentId || !comment) {
      return res.status(400).json({
        message: "Appointment ID and comment are required",
      });
    }

    // Find and update feedback
    const feedback = await Feedback.findOneAndUpdate(
      { appointmentId },
      {
        comment,
        feedbackDate: new Date(),
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        message: "No feedback record found for this appointment",
      });
    }

    res.status(200).json({
      message: "Feedback submitted successfully",
      data: {
        feedbackId: feedback.feedbackId,
        appointmentId: feedback.appointmentId,
        comment: feedback.comment,
        feedbackDate: feedback.feedbackDate,
      },
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
      details: error.message,
    });
  }
};
// after email create i was add  agian to
const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    await Feedback.findByIdAndUpdate(id, { reply });
    res.status(200).json({ message: "Reply added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//  Update Action Status
const updateActionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    feedback.actionStatus = feedback.actionStatus === "yes" ? "no" : "yes";
    await feedback.save();

    res.status(200).json({ message: "Action status updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft Delete Feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndUpdate(id, { deleted: true });
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getFeedbacks,
  submitFeedback,
  addReply,
  updateActionStatus,
  deleteFeedback,
};
