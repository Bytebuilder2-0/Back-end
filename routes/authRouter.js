const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	sendForgotPasswordOTP,
	resetPasswordWithOTP,
	sendOtpEmail,
} = require("../controllers/authController.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/reset-password", resetPasswordWithOTP);
router.post("/send-otp-email", sendOtpEmail);

module.exports = router;
