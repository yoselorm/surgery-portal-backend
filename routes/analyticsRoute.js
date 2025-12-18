const express = require('express')
const { adminAuthMiddleware } = require('../middlewares/authMiddleware')
const { getDashboardAnalytics, getSurgeryTrends, getDoctorPerformance, getLocationStats, getRecentSurgeries } = require('../controllers/analyticsController')

const analyticsRouter = express.Router()

analyticsRouter.get('/analytics/dashboard',adminAuthMiddleware,getDashboardAnalytics)
analyticsRouter.get('/analytics/trends',adminAuthMiddleware,getSurgeryTrends)
analyticsRouter.get('/analytics/doctor-performance',adminAuthMiddleware,getDoctorPerformance)
analyticsRouter.get('/analytics/location-stats',adminAuthMiddleware,getLocationStats)
analyticsRouter.get('/analytics/recent-surgeries',adminAuthMiddleware,getRecentSurgeries)

module.exports = analyticsRouter