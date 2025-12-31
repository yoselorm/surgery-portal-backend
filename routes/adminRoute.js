const express = require('express')
const { register, getAllUsers, updateUser } = require('../controllers/adminController')
const { adminAuthMiddleware } = require('../middlewares/authMiddleware')
const { filterFunction } = require('../controllers/filterController')

const adminRouter = express.Router()

adminRouter.post('/register',register)
adminRouter.get('/users',adminAuthMiddleware, getAllUsers)
adminRouter.post('/users/:id',adminAuthMiddleware,updateUser)
adminRouter.post('/surgery/filter-export',adminAuthMiddleware,filterFunction)
module.exports = adminRouter