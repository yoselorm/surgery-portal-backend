const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(404).json({ message: 'Admin not found' })

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

        const accessToken = jwt.sign({ id: admin._id, type: 'admin' }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: admin._id, type: 'admin' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

        admin.refreshToken = refreshToken;
        await admin.save()

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            path: '/',
        })
        //    res.cookie('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'none',
        //     maxAge: 7 * 24 * 60 * 60 * 1000, 
        //     path: '/',
        //     domain: '.onrender.com'
        // })
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        delete adminResponse.refreshToken;

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            admin: adminResponse
        })
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Server error' })
    }

}

exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

        const isActive = user.status === 'active';
        if (!isActive) return res.status(401).json({ message: 'Account Flagged. Contact Admin' })

        const accessToken = jwt.sign({ id: user._id, type: 'user' }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: user._id, type: 'user' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

        // user.refreshToken = {
        //     token: refreshToken,
        //     createdAt: new Date()
        // }
        user.refreshToken = refreshToken;
        await user.save()

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            path: '/',
        })

        //    res.cookie('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'none',
        //     maxAge: 7 * 24 * 60 * 60 * 1000, 
        //     path: '/',
        //     domain: '.onrender.com'
        // })


        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(200).json({
            message: 'Login Successful',
            accessToken,
            user: userResponse
        })
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ error: 'Server error' })
    }
}

// export const refreshAccessToken = async (req, res) => {
//     const { refreshToken } = req.body;
//     // const { refreshToken } = req.cookies;
//     if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

//     try {
//         const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
//         const Model = decoded.type === 'admin' ? Admin : User;

//         const account = await Model.findById(decoded.id);
//         if (!account || account.refreshToken !== refreshToken) {
//             return res.status(403).json({ message: 'Invalid refresh token' });
//         }

//         const newAccessToken = jwt.sign({ id: account._id, type: decoded.type }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

//         res.json({ accessToken: newAccessToken });
//     } catch (err) {
//         console.error('Refresh token error:', err);
//         res.status(403).json({ message: 'Token expired or invalid' });
//     }
// };

// exports.refreshAccessToken = async (req, res) => {
//     const { refreshToken } = req.cookies;
//     console.log(req.cookies)
//     if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

//     try {
//         const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
//         const Model = decoded.type === 'admin' ? Admin : User;

//         const account = await Model.findById(decoded.id);

//         const tokenExists = account.refreshTokens?.some(t => t.token === refreshToken);

//         if (!account || !tokenExists) {
//             // Potential token reuse attack - invalidate all tokens
//             account.refreshTokens = [];
//             await account.save();
//             return res.status(403).json({ message: 'Invalid refresh token' });
//         }

//         // Generate NEW access AND refresh tokens
//         const newAccessToken = jwt.sign({ id: account._id, type: decoded.type }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
//         const newRefreshToken = jwt.sign({ id: account._id, type: decoded.type }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

//         // Replace old refresh token with new one (rotation)
//         account.refreshTokens = account.refreshTokens.map(t =>
//             t.token === refreshToken
//                 ? { token: newRefreshToken, createdAt: new Date() }
//                 : t
//         );
//         await account.save();

//         // Send new refresh token as cookie
//         res.cookie('refreshToken', newRefreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         res.json({ accessToken: newAccessToken });
//     } catch (err) {
//         console.error('Refresh token error:', err);
//         res.status(403).json({ message: 'Token expired or invalid' });
//     }
// };

exports.refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    console.log('🍪 Cookies:', req.cookies);
    
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const Model = decoded.type === 'admin' ? Admin : User;
        const account = await Model.findById(decoded.id);

        // 🔧 FIX: Check singular refreshToken
        if (!account || account.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { id: account._id, type: decoded.type }, 
            ACCESS_TOKEN_SECRET, 
            { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
            { id: account._id, type: decoded.type }, 
            REFRESH_TOKEN_SECRET, 
            { expiresIn: '7d' }
        );

        // Save new token
        account.refreshToken = newRefreshToken;
        await account.save();

        // Set cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(403).json({ message: 'Token expired or invalid' });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const Model = decoded.type === 'admin' ? Admin : User;

        const account = await Model.findById(decoded.id);

        if (account) {
            // Invalidate the refresh token
            account.refreshToken = null;
            await account.save();
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        }); res.json({ message: 'Logged out successfully' });
    } catch (err) {
        // Even if token is invalid, clear the cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        }); res.json({ message: 'Logged out successfully' });
    }
};


exports.updatePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validation
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Password strength validation (optional but recommended)
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        user.updatePassword = true;
        await user.save();

        res.status(200).json({
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}



exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        console.log(user)

        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, a reset link has been sent",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
      You requested a password reset.
      Click the link below to reset your password:
      ${resetUrl}

      This link expires in 15 minutes.
      If you did not request this, please ignore this email.
    `;

        await sendEmail({
            to: user.email,
            subject: "Password Reset",
            text: message,
        });

        res.status(200).json({
            message: "If this email exists, a reset link has been sent",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error)
    }
};
