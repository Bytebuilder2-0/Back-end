const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	sendForgotPasswordOTP,
	resetPasswordWithOTP,
	approveUser, // New function to approve users
	getPendingUsers, // New function to get pending users
	rejectUser,
	getStaffProfile // New function to get staff profile
} = require("../controllers/authController.js");
const { authMiddleware } = require("../middlewares/userAuthMiddleware.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/reset-password", resetPasswordWithOTP);
router.get("/staff-profile",authMiddleware ,getStaffProfile); // New route to get staff profile

router.get("/pending-users", getPendingUsers); // New route to get pending users
router.post("/approve-user/:userId", approveUser); // New route for approving users
router.delete("/reject-user/:userId", rejectUser); 


module.exports = router;