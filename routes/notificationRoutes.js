const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { authMiddleware } = require("../middlewares/userAuthMiddleware");

// Get all notifications for a user
router.get("/user/:userId", authMiddleware, getUserNotifications);

// Get unread notification count
router.get("/user/:userId/unread-count", authMiddleware, getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", authMiddleware, markAsRead);

// Mark all notifications as read for a user
router.patch("/user/:userId/read-all", authMiddleware, markAllAsRead);

// Delete a notification
router.delete("/:notificationId", authMiddleware, deleteNotification);

module.exports = router;
