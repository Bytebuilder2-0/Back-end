const Appointment = require("../models/Appointment");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service")

const createAppointment = async (req, res) => {
    try {

        const { vehicleId, services, issue, preferredTime, expectedDeliveryDate, contactNumber } = req.body;

        if (!vehicleId || !services || !preferredTime || !expectedDeliveryDate || !contactNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("Request User Object:", req.user); 
        const userId = req.user.id;
    
        const userVehicles = await Vehicle.find({ user: userId });

        const selectedVehicle = userVehicles.find(vehicle => vehicle._id.toString() === vehicleId);
    
        if (!selectedVehicle) {
            return res.status(400).json({ message: "Invalid vehicle selected" });
        }

        const validServices = await Service.find({}, { name: 1, _id: 0 }); 

        const validServiceNames = validServices.map(service => service.name);

        const selectedServices = services.filter(service => validServiceNames.includes(service));

        if (selectedServices.length === 0) {
            return res.status(400).json({ message: "Please select at least one valid service" });
        }

        if (!/^\d{10}$/.test(contactNumber)) {
            return res.status(400).json({ message: "Invalid contact number" });
        }

        if (!/^\d{1,2}:\d{2} (AM|PM)$/i.test(preferredTime)) {
            return res.status(400).json({ message: "Invalid preferred time format (use HH:MM AM/PM)" });
        }

        const deliveryDate = new Date(expectedDeliveryDate);
        if (deliveryDate <= new Date()) {
            return res.status(400).json({ message: "Expected delivery date must be in the future" });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            userId,
            vehicleId,
            vehicleNumber: selectedVehicle.vehicleNumber,
            model: selectedVehicle.model,
            issue,
            status: "Pending",
            services: selectedServices,
            preferredTime,
            expectedDeliveryDate: deliveryDate,
            contactNumber
        });

        await newAppointment.save();
        res.status(201).json({ message: "✅ Appointment created successfully", newAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { createAppointment };