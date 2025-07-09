const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, } = require('../controllers/authController.js');
const { loginTechnician } = require('../controllers/login_Tech.js');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);



module.exports = router;