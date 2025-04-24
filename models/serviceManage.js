const mongoose = require("mongoose");
// service manage schema
const serviceeddSchema = new mongoose.Schema({
  name: { type: String, required: true },
  selected: { type: Boolean, default: false },
  type: { type: String, enum: ["customer", "garage"], required: true }, // added service type
});

const ServiceManage = mongoose.model("ServiceManages", serviceeddSchema);
module.exports = ServiceManage;
