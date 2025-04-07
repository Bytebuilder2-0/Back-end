const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  try {
    const { email, fullName, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validate role (optional: only allow specific roles)
    const allowedRoles = ["customer", "technician", "manager", "Supervisor", "admin"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    // Create new user
    const newUser = new User({
      email,
      fullName,
      phone,
      password: hashedPassword,
      role: userRole,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { signup };
