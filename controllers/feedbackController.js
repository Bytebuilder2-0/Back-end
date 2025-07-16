const Feedback = require("../models/Feedback");
const Appointment = require("../models/Appointment");


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
    const { id: appointmentId } = req.params;
    const { rating, comment, actionStatus } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating (1-5)"
      });
    }

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Create new feedback - MUST use appointmentId to match model
    const feedback = new Feedback({
      user: userId,
      appointmentId: appointmentId,  // Changed to match model
      rating,
      comment: comment || "",
      actionStatus: actionStatus || "no"
      // feedbackDate will be auto-set by model
    });

    await feedback.save();
    console.log('Feedback saved successfully:', feedback.feedbackId);

    // Update appointment with feedback reference
    appointment.feedbackId = feedback._id;
    appointment.feedbackStatus = true;
    await appointment.save();

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        feedbackId: feedback.feedbackId,  // Using the generated FB00001 ID
        appointmentId: appointment._id,
        rating: feedback.rating,
        comment: feedback.comment,
        actionStatus: feedback.actionStatus,
        date: feedback.feedbackDate
      }
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit feedback",
      details: error.message
    });
  }
};

// const getUserFeedbacks = async (req,res) =>{

//   try{
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }    
//     const userObjectId = new mongoose.Types.ObjectId(userId);
    
//     const userExists = await User.exists({ _id: userObjectId });
//     if (!userExists) {
//       console.log(`User ${userId} not found`);
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }



// }
// };

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
  // getUserFeedbacks
};
