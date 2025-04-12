const mongoose = require("mongoose");

const serviceeddSchema = new mongoose.Schema({
  name: { type: String, required: true },
  selected: { type: Boolean, default: false },
});

const ServiceManage = mongoose.model("ServiceManages", serviceeddSchema);
module.exports = ServiceManage;
