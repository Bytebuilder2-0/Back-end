const Appointment = require("../models/Appointment.js");
const mongoose = require("mongoose");

// 1️⃣ Create a new appointment (Client submits form)
const createAppointment = async(req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res
            .status(201)
            .json({ message: "✅ Appointment created successfully", newAppointment });
    } catch (error) {
        console.error("🚨 Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 2️⃣ Get all appointments (Supervisor dashboard)
const getAppointments = async(req, res) => {
    try {
        const appointments = await Appointment.find({},
            "vehicleId vehicleNumber model issue workload tech status techMessage contactNumber"
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3️⃣ Update workload for an appointment (Supervisor updates workload)
const updateWorkload = async(req, res) => {
    const { workload } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (!workload || workload.trim() === "") {
            return res.status(400).json({ message: "Workload cannot be empty" });
        }

        appointment.workload = workload;
        await appointment.save();

        res.json({ message: "✅ Workload updated successfully", appointment });
    } catch (error) {
        console.error("🚨 Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const suggestionWrite = async(req, res) => {
    const { suggestion } = req.body;
    const { appointmentId } = req.params;

    if (!mongoose.isValidObjectId(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (!suggestion || suggestion.trim() === "") {
            return res.status(400).json({ message: "Suggestion cannot be empty" });
        }

        appointment.suggestion = suggestion;
        await appointment.save();

        res.json({ message: "✅ Suggestion updated successfully", appointment });
    } catch (error) {
        console.error("🚨 Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { createAppointment, getAppointments, updateWorkload, suggestionWrite };