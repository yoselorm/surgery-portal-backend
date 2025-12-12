const express = require('express')
const { register } = require('../controllers/adminController')

const adminRouter = express.Router()

adminRouter.post('/register',register)

module.exports = adminRouter