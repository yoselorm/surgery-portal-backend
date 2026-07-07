const express = require('express')
const { adminLogin, userLogin, refreshAccessToken, updatePassword, logout, forgotPassword, resetPassword } = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { authLimiter, refreshLimiter } = require('../middlewares/rateLimiiter')

const authRouter = express.Router()

authRouter.post('/admin-login', authLimiter, adminLogin)
authRouter.post('/user-login', authLimiter, userLogin)
authRouter.post('/refresh-token', refreshLimiter, refreshAccessToken)
authRouter.post('/update-password', authMiddleware, updatePassword)
authRouter.post('/logout', logout)
authRouter.post('/forgot-password', authLimiter, forgotPassword)
authRouter.post('/reset-password/:token', authLimiter, resetPassword)

module.exports = authRouter