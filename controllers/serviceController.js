const Service = require("../models/Service");

const setServices =  async(req,res) => {

    try{

        const { name, description } = req.body;
        
        const newService = new Service({
            name,
            description
    });

    await newService.save();
    res.status(201).json({ message: "service created successfully", service:Service });
    }

    catch(error){
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getServices, setServices };