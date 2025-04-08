const Auth = require('../models/auth.js');  // Import your model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Registration with Role-based access
exports.registerUser = async (req, res) => {
  try {
    const { email, fullName, userName, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Validate role
    const allowedRoles = ['customer', 'technician', 'manager', 'Supervisor'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid Role Provided' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create New User
    const newUser = new Auth({
      email,
      fullName,
      userName,
      phone,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: `${role} registered successfully`,
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};
