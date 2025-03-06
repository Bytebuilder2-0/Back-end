const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId,
     ref: "User", 
     required: true }, // Reference to User

  vehicleNumber: { type: String, required: true },
  model: { type: String, required: true },
  vehicleType: { type: String, required: true },
},
{ timestamps: true });

const Vehicle =  mongoose.model("Vehicle", VehicleSchema);

module.exports = Vehicle;