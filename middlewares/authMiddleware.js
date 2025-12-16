const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET 

exports.authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const id = decoded.id

        const user = await User.findById(decoded.id).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        const user = await Admin.findById(decoded.id).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};