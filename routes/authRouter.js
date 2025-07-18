const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	logoutUser,
	sendForgotPasswordOTP,
	resetPasswordWithOTP,
} = require("../controllers/authController.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/reset-password", resetPasswordWithOTP);

module.exports = router;
