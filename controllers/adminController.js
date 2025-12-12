const bcrypt = require('bcrypt')
const User = require("../models/userModel");
const sendDoctorCredentials = require('../utils/emailService');



exports.register = async (req,res) => {
    console.log(req.body)
   try {
    const { email, fullname, phone, specialty, country, city, } = req.body;
    const compulsoryFields = { email, fullname, specialty, country, city }

    if (Object.values(compulsoryFields).some(value => !value)) {
        return res.status(400).json({ message: "Please fill all compulsory fields" });
    }

    const existingDoctor = await User.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await User.create({
        fullname,
        email,
        specialty,
        country,
        city,
        phone,
        password: hashedPassword,
        passwordUpdated: false,
    });

    await user.save()

    await sendDoctorCredentials(email, fullname,randomPassword);

    res.status(201).json({
        message:'User created successfully',
        user:{
            fullname:user.fullname,
            email: user.email,
            specialty:user.specialty,
            phone: user.phone,
            doctorId: user.doctorId,
            status:user.status
        
        }

    })
   } catch (error) {
    console.log(error)
    res.status(500).json({error:'server error'})
   }

}