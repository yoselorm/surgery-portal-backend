const express = require('express')
const { adminLogin, userLogin, refreshAccessToken, updatePassword } = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const authRouter = express.Router()

authRouter.post('/admin-login',adminLogin)
authRouter.post('/user-login',userLogin)
authRouter.post('/refreshToken',refreshAccessToken)
authRouter.post('/update-password',authMiddleware,updatePassword)

module.exports = authRouter