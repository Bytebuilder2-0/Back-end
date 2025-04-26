const Auth = require('../models/auth.js');  // Import your model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// User Registration with Role-based access
const registerUser = async (req, res) => {
  try {
    const { email, fullName, userName, phone, password, role } = req.body;


    //----------------------------------------------------------------------------
     // Validate input fields
     if (!email || !fullName || !userName || !phone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    
    // Validate role
    const allowedRoles = ['customer', 'technician', 'manager', 'Supervisor'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid Role Provided' });
    }

    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
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


// User Login function
const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
   //---------------------------------------------------------------------------------------
      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if user exists
      const user = await Auth.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found. Please register." });
      }
  
      // Check if user is disabled
      if (user.isDisabled) {
        return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      // Generate JWT Token
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      // Send response with role-based success message
      res.status(200).json({
        message: `Login successful as ${user.role}`,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          userName: user.userName,
          role: user.role,
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    } 
   };
  
 module.exports = { registerUser, loginUser };
