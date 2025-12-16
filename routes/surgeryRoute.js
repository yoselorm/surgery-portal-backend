const express = require('express')
const { authMiddleware, adminAuthMiddleware } = require('../middlewares/authMiddleware')
const { getAllSurgeries, addSurgery, getSurgeryById, updateSurgery, completeSurgery, getMySurgeries, getSurgeriesByDoctor, getDoctorsSurgeryById } = require('../controllers/surgeryController')

const surgeryRouter = express.Router()

surgeryRouter.get('/surgery',adminAuthMiddleware,getAllSurgeries);
surgeryRouter.get('/surgery/my',authMiddleware,getMySurgeries);
surgeryRouter.get('/surgery/:doctorId',adminAuthMiddleware,getSurgeriesByDoctor);
surgeryRouter.post('/surgery',authMiddleware,addSurgery);
surgeryRouter.get('/admin/surgery/:id',adminAuthMiddleware,getSurgeryById)
surgeryRouter.get('/user-surgery/:id',authMiddleware,getDoctorsSurgeryById)
surgeryRouter.post('/update-surgery/:id',authMiddleware,updateSurgery)
surgeryRouter.post('/complete-surgery/:id',authMiddleware,completeSurgery)


module.exports = surgeryRouter