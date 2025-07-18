const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },//--------------------------------
  userName: { type: String, required: true },
  phone: { type: String, required: true },
  profilePhoto: { type: String, default: "" },

  vehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"    // Reference to the Vehicle model
  }]
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;