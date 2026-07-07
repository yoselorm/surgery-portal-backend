const bcrypt = require('bcrypt')
const User = require("../models/userModel");
const { sendDoctorCredentials } = require('../utils/emailService');



exports.register = async (req, res) => {
    console.log(req.body)
    try {
        const { email, fullname, phone, specialty, country, city, } = req.body;

        // Only fullname is required now — everything else is optional.
        if (!fullname) {
            return res.status(400).json({ message: "Full name is required" });
        }

        if (email) {
            const existingDoctor = await User.findOne({ email });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Doctor already exists' });
            }
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

        let emailSent = true;
        if (email) {
            try {
                await sendDoctorCredentials(email, fullname, randomPassword);
            } catch (emailErr) {
                // Don't fail the whole registration just because the email
                // provider (Brevo) rejected/failed — the account still
                // exists, the admin just needs to know credentials weren't
                // delivered so they can resend or share them manually.
                console.error('Failed to send doctor credentials email:', emailErr.message);
                emailSent = false;
            }
        }

        res.status(201).json({
            message: emailSent
                ? 'User created successfully'
                : 'User created successfully, but the credentials email failed to send',
            emailSent,
            user: {
                _id:user._id,
                fullname: user.fullname,
                email: user.email,
                specialty: user.specialty,
                phone: user.phone,
                doctorId: user.doctorId,
                status: user.status,
                country: user.country,
                city: user.city,

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
        const emailIsChanging = email && email !== user.email;

        if (emailIsChanging) {
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

        // Email changed → the old credentials went to an address the doctor
        // no longer uses, so reset the password and resend fresh credentials
        // to the new address.
        let newPlainPassword = null;
        if (emailIsChanging) {
            newPlainPassword = Math.random().toString(36).slice(-8);
            user.password = await bcrypt.hash(newPlainPassword, 10);
            user.passwordUpdated = false;
        }

        // Save user
        await user.save();

        let emailSent = true;
        if (emailIsChanging) {
            try {
                await sendDoctorCredentials(user.email, user.fullname, newPlainPassword);
            } catch (emailErr) {
                // Same reasoning as register: don't fail the update just
                // because Brevo failed — the account is updated either way,
                // the admin just needs to know to resend/share manually.
                console.error('Failed to send updated doctor credentials email:', emailErr.message);
                emailSent = false;
            }
        }

        // Return user without sensitive data
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(200).json({
            message: emailIsChanging
                ? (emailSent
                    ? 'User updated successfully. New credentials sent to the updated email.'
                    : 'User updated successfully, but the new credentials email failed to send')
                : 'User updated successfully',
            emailSent: emailIsChanging ? emailSent : undefined,
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