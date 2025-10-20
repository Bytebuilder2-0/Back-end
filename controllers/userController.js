const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, vehicles } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user
    const savedUser = await newUser.save();

    if (vehicles) {
      for (const vehicle of vehicles) {
        const { model, vehicleNumber, vehicleType } = vehicle;

        const newVehicle = new Vehicle({
          user: savedUser._id, // Link vehicle to user
          model,
          vehicleNumber,
          vehicleType,
        });

        await newVehicle.save();
      }
    }

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const getUserById = async (req, res) => {
  console.log("Fetching user by ID:", req.params.user_id);
  try {
    const user = await User.findById(req.params.user_id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, userName, phone, password } = req.body;
    const profilePhoto = req.file?.path;

    const updateData = {};

    if (email) updateData.email = email;
    if (userName) updateData.name = userName;
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all vehicles linked to the user
    await Vehicle.deleteMany({ user: userId });

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User and related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};
const getUserProfile = async (req, res) => {
  console.log(req);
  try {
    const userId = req.user.id;
    console.log("User ID from token:", userId);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user }); // return user inside an object
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

module.exports = { registerUser, getUserById, updateUserProfile, deleteUser, getUserProfile };
