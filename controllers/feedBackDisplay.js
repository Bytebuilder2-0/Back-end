const crypto = require("crypto"); // Importing the crypto module
const Feedback = require("../models/Feedback");

// Define md5 function (if using Gravatar, but not needed for UI Avatars)
function md5(string) {
  return crypto.createHash("md5").update(string).digest("hex");
}

const getFeedbacks = async (req, res) => {
  try {
    // Fetch feedback data
    const feedbacks = await Feedback.find({
      actionStatus: "yes",
      deleted: false,
      comment: { $ne: "" },
    }).populate({
      path: "appointmentId",
      select: "_id",
      populate: {
        path: "userId",
        select: "name email", // Make sure the userId object includes name and email
      },
    });

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No feedback available",
        data: [],
      });
    }

    // Format feedbacks
    const formattedFeedbacks = feedbacks.map((feedback) => {
      // Generate a fallback avatar using UI Avatars (based on username or email)
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        feedback.appointmentId?.userId?.name || "User"
      )}&background=random&color=fff&font-size=0.3`;

      return {
        id: feedback._id,
        feedbackId: feedback.feedbackId,
        username: feedback.appointmentId?.userId?.name || "Anonymous",
        userComment: feedback.comment,
        adminReply: feedback.reply,
        feedbackDate: feedback.feedbackDate,
        avatarUrl: avatarUrl, // Pass the avatar URL to frontend
      };
    });

    res.status(200).json({
      success: true,
      message: "Feedbacks fetched successfully",
      data: formattedFeedbacks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  getFeedbacks,
};
