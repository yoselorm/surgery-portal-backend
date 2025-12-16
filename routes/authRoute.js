const express = require('express')
const { adminLogin, userLogin, refreshAccessToken, updatePassword, logout, forgotPassword, resetPassword } = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const authRouter = express.Router()

authRouter.post('/admin-login',adminLogin)
authRouter.post('/user-login',userLogin)
authRouter.post('/refresh-token',refreshAccessToken)
authRouter.post('/update-password',authMiddleware,updatePassword)
authRouter.post('/logout',logout)
authRouter.post('/forgot-password',forgotPassword)
authRouter.post('/reset-password/:token',resetPassword)

module.exports = authRouter