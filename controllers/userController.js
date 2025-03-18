const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function saveUser(req, res) {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log(hashedPassword);
    const user = new User({
      email: req.body.email,
      fullName: req.body.fullName,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role,
    });
    const result = await user.save();
    res.json({
      message: "User saved successfully",
      data: result,
    });
  } catch (err) {
    res.json({
      message: "An error occurred",
      error: err,
    });
  }
}

async function loginUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email",
      });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (isPasswordCorrect) {
      const userData = {
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isDisabled: user.isDisabled,
        isEmailVerified: user.isEmailVerified,
      };
      // Creating token using jwt sign() method
      const token = jwt.sign(userData, "pw456"); // api random hadapu key ek pw456
      res.json({
        message: "Login successful",
        token: token,
        data: userData,
      });
    } else {
      res.status(403).json({
        message: "Invalid password",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "An error occurred during login",
      error: err,
    });
  }
}

module.exports = { saveUser, loginUser };
