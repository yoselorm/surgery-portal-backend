const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Helper function to validate password strength
const isPasswordValid = (password) => password && password.length >= 8;

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = jwt.sign({ id: admin._id, type: 'admin' }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: admin._id, type: 'admin' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        admin.refreshToken = refreshToken;
        await admin.save();

        const adminResponse = admin.toObject();
        delete adminResponse.password;
        delete adminResponse.refreshToken;

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            admin: adminResponse
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Account Flagged. Contact Admin' });
        }

        const accessToken = jwt.sign({ id: user._id, type: 'user' }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, type: 'user' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        user.refreshToken = refreshToken;
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(200).json({
            message: 'Login Successful',
            accessToken,
            refreshToken,
            user: userResponse
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const Model = decoded.type === 'admin' ? Admin : User;
        const account = await Model.findById(decoded.id);

        if (!account || account.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign({ id: account._id, type: decoded.type }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: account._id, type: decoded.type }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        account.refreshToken = newRefreshToken;
        await account.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(403).json({ message: 'Token expired or invalid' });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        let account = null;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
                const Model = decoded.type === 'admin' ? Admin : User;
                account = await Model.findById(decoded.id);
            } catch (e) {}
        }

        if (!account) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const accessToken = authHeader.split(' ')[1];
                    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
                    const Model = decoded.type === 'admin' ? Admin : User;
                    account = await Model.findById(decoded.id);
                } catch (e) {}
            }
        }

        if (account) {
            account.refreshToken = null;
            await account.save();
        }

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.json({ message: 'Logged out successfully' });
    }
};

// FIXED: Added currentPassword check to prevent session hijacking takeovers
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id; 

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (!isPasswordValid(newPassword)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Verify old password before updating
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.updatePassword = true; // Assuming this flags that they have updated it
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });

        // Defend against email enumeration
        if (!user) {
            return res.status(200).json({ message: "If this email exists, a reset link has been sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `You requested a password reset. Click the link below to reset your password:\n${resetUrl}\n\nThis link expires in 15 minutes.`;

        await sendEmail({ to: user.email, subject: "Password Reset", text: message });

        res.status(200).json({ message: "If this email exists, a reset link has been sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// FIXED: Added missing password strength check
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ message: "Password is required" });

        if (!isPasswordValid(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};