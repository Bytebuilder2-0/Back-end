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

    const services = await Service.find({});
    console.log("Fetched services:", services); 
    res.status(200).json(services);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getServices, setServices };