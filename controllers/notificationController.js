const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../models/auth");

// Helper function to create notification
const createNotification = async (
  userId,
  role,
  message,
  type,
  appointmentId = null,
  req = null
) => {
  try {
    const notification = new Notification({
      userId,
      role,
      message,
      type,
      appointmentId,
    });
    await notification.save();

    // Emit real-time notification via Socket.IO if available
    if (req && req.app) {
      const io = req.app.get("io");
      const connectedUsers = req.app.get("connectedUsers");

      if (io && connectedUsers) {
        const socketId = connectedUsers.get(userId.toString());
        if (socketId) {
          io.to(socketId).emit("newNotification", {
            notification,
            unreadCount: await Notification.countDocuments({
              userId,
              isRead: false,
            }),
          });
          console.log(`Real-time notification sent to user ${userId}`);
        }
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isRead, limit = 50 } = req.query;

    const filter = { userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const notifications = await Notification.find(filter)
      .populate("appointmentId", "vehicleNumber status preferredDate")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// Get notifications for all managers (for new appointment notifications)
const notifyAllManagers = async (message, type, appointmentId, req = null) => {
  try {
    const managers = await auth.find({ role: "manager" });

    const notifications = managers.map((manager) => ({
      userId: manager._id,
      role: "manager",
      message,
      type,
      appointmentId,
    }));

    const savedNotifications = await Notification.insertMany(notifications);
    console.log(`Notified ${managers.length} managers`);

    // Emit real-time notifications via Socket.IO
    if (req && req.app) {
      const io = req.app.get("io");
      const connectedUsers = req.app.get("connectedUsers");

      if (io && connectedUsers) {
        for (let i = 0; i < managers.length; i++) {
          const managerId = managers[i]._id.toString();
          const socketId = connectedUsers.get(managerId);

          if (socketId) {
            const unreadCount = await Notification.countDocuments({
              userId: managers[i]._id,
              isRead: false,
            });

            io.to(socketId).emit("newNotification", {
              notification: savedNotifications[i],
              unreadCount,
            });
            console.log(`Real-time notification sent to manager ${managerId}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error notifying managers:", error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAllManagers,
};
