const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');

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
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        const adminResponse = admin.toObject();
        delete adminResponse.password;
        delete adminResponse.refreshToken;

        res.status(200).json({
            message: 'Login successful',
            admin: {
                ...adminResponse,
                accessToken
            }
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

        const accessToken = jwt.sign({ id: user._id, type: 'user' }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: user._id, type: 'user' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

        user.refreshToken = {
            token: refreshToken,
            createdAt: new Date()
        }
        await user.save()

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,

        })
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(200).json({
            message: 'Login Successful',
            user: {...userResponse,accessToken}
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

exports.refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const Model = decoded.type === 'admin' ? Admin : User;

        const account = await Model.findById(decoded.id);

        const tokenExists = account.refreshTokens?.some(t => t.token === refreshToken);

        if (!account || !tokenExists) {
            // Potential token reuse attack - invalidate all tokens
            account.refreshTokens = [];
            await account.save();
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate NEW access AND refresh tokens
        const newAccessToken = jwt.sign({ id: account._id, type: decoded.type }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: account._id, type: decoded.type }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        // Replace old refresh token with new one (rotation)
        account.refreshTokens = account.refreshTokens.map(t =>
            t.token === refreshToken
                ? { token: newRefreshToken, createdAt: new Date() }
                : t
        );
        await account.save();

        // Send new refresh token as cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('Refresh token error:', err);
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
        const { new_password, confirmed_password } = req.body;
        const userId = req.user.id;

        // Validation
        if (!new_password || !confirmed_password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (new_password !== confirmed_password) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Password strength validation (optional but recommended)
        if (new_password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

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