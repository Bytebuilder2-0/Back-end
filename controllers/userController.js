const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, vehicles } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    if (vehicles) {
      for (const vehicle of vehicles) {
        const { model, vehicleNumber, vehicleType } = vehicle;

        const newVehicle = new Vehicle({
          user: savedUser._id,
          model,
          vehicleNumber,
          vehicleType
        });

        await newVehicle.save();
      }
    }

    res.status(201).json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, userName, phone, profilePhoto } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (userName) updateData.name = userName; // Assuming 'name' field holds full name
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Get profile
const getUserProfile = async (req, res) => {
  try {
    console.log("Decoded user from token:", req.user); 
    const userId = req.user.id;
    


    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
    console.log('Returning profile with photo:', user.profilePhoto?.substring(0, 30));

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// Delete profile
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

module.exports = {
  registerUser,
  updateUserProfile,
  getUserProfile,
  deleteUser
};
