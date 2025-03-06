const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
   name: { 
       type: String, 
       required: true, 
       unique:true,
       enum: ["A/C repair", "Oil change", "Break Services"] 
   },
   description: { 
       type: String, 
       required: true 
   }
}, { timestamps: true });



const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;