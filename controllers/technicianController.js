const Technician = require("../models/Technician");

// 1️⃣ Add a new technician
exports.createTechnician = async(req, res) => {
    try {
        const { technician_id, employee_id, department } = req.body;

        if (!technician_id || !employee_id || !department) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTechnician = new Technician({ technician_id, employee_id, department });
        await newTechnician.save();

        res.status(201).json({ message: "✅ Technician added successfully", newTechnician });
    } catch (error) {
        console.error("🚨 Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 2️⃣ Get all technicians
exports.getTechnicians = async(req, res) => {
    try {
        const technicians = await Technician.find();
        res.json(technicians);
    } catch (error) {
        console.error("🚨 Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};