const crypto = require("crypto"); // Importing the crypto module

const Feedback = require("../models/Feedback");

// Define md5 function
function md5(string) {
  return crypto.createHash("md5").update(string).digest("hex");
}

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      actionStatus: "yes",
      deleted: false,
      comment: { $ne: "" },
    }).populate({
      path: "appointmentId",
      select: "_id",
      populate: {
        path: "userId",
        select: "name email",
      },
    });

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No feedback available",
        data: [],
      });
    }

    const formattedFeedbacks = feedbacks.map((feedback) => {
      return {
        id: feedback._id,
        feedbackId: feedback.feedbackId,
        username: feedback.appointmentId?.userId?.name || "Anonymous",
        userComment: feedback.comment,
        adminReply: feedback.reply,
        feedbackDate: feedback.feedbackDate,
        avatarUrl: `https://www.gravatar.com/avatar/${md5(
          (feedback.appointmentId?.userId?.email || "").toLowerCase().trim()
        )}?d=identicon`,
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
