const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
   name: { 
       type: String, 
       required: true, 
       unique:true,
   },
   description: { 
       type: String, 
       required: false 
   }
}, { timestamps: true });



const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;