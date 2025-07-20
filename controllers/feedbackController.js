const Feedback = require("../models/Feedback");
const Appointment = require("../models/Appointment");


//  Fetch feedbacks (excluding deleted)  for manager
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      deleted: false,
      comment: { $ne: "" },
    }).populate({
      path: "appointmentId",
      select: "_id", // Make sure we only get the ID
      populate: {
        path: "userId",
        select: "name", // Only get the name field from User
      },
    });

    // Map the feedbacks to include the username
    const feedbacksWithUsername = feedbacks.map((feedback) => {
      const appointmentId = feedback.appointmentId?._id?.toString(); // Ensure we get the string ID
      return {
        ...feedback.toObject(),
        appointmentId, // Make sure appointmentId is a string
        username: feedback.appointmentId?.userId?.name || "Unknown",
      };
    });

    res.status(200).json({
      message: "Fetched successfully!",
      data: feedbacksWithUsername,
    });
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

const getUserFeedbacks = async (req,res) =>{
  
  try{

     const { id } = req.params;
    const appointment = await Appointment.findOne({
      _id: id,
      feedbackStatus: true
    }).populate('feedbackId'); 

   if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }  
    
    const feedback = appointment.feedbackId;

     if (!feedback) {
      return res.status(404).json({ message: 'Feedback details not found' });
    }

    res.json({
      success: true,
      data: feedback,
      appointmentDetails: {
        preferredDate : appointment.preferredDate,
        expectedDeliveryDate : appointment.expectedDeliveryDate,
        vehicleNumber: appointment.vehicleNumber,
        model: appointment.model,
        services: appointment.services,
        status: appointment.status
      }

    });
}
 catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
  getUserFeedbacks
};
