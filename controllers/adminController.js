const bcrypt = require('bcrypt')
const User = require("../models/userModel");
const { sendDoctorCredentials } = require('../utils/emailService');



exports.register = async (req, res) => {
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

        await sendDoctorCredentials(email, fullname, randomPassword);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                _id:user._id,
                fullname: user.fullname,
                email: user.email,
                specialty: user.specialty,
                phone: user.phone,
                doctorId: user.doctorId,
                status: user.status,
                country: user.country,
                city: user.city

            }

        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'server error' })
    }

}

exports.getAllUsers = async (req, res) => {
    try {
        // Exclude sensitive fields
        const users = await User.find()
            .select('-password -refreshToken')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Check if users exist
        if (!users || users.length === 0) {
            return res.status(404).json({
                message: 'No users found',
                users: []
            });
        }

        res.status(200).json({
            message: 'Users retrieved successfully',
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fullname,
            email,
            phone,
            country,
            specialty,
            city,
            status,
        } = req.body;

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: id }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update basic fields
        if (fullname) user.fullname = fullname;
        if (specialty) user.specialty = specialty;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (city) user.city = city;
        if (country) user.country = country;
        if (status) user.status = status;


        // Save user
        await user.save();

        // Return user without sensitive data
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(200).json({
            message: 'User updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Update user error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};


