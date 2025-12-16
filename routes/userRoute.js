const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { updateUser } = require('../controllers/adminController')

const userRoute = express.Router()

userRoute.post('/user/:id',authMiddleware,updateUser)

module.exports = userRoute