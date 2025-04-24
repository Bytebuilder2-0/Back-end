const Feedback = require("../models/Feedback");

//  Fetch feedbacks (excluding deleted)
const getFeedbacks = async (req, res) => {};

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

// ✅ Soft Delete Feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndUpdate(id, { deleted: true });
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getFeedbacks, addReply, updateActionStatus, deleteFeedback };
