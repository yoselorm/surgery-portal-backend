const express = require('express')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { getMyDashboard, getMyTrends, getMyRecentSurgeries, getMySurgeryBreakdown, getMyComparison, getMyQuickStats } = require('../controllers/doctorAnalyticsController')

const doctorAnalytics = express.Router()

doctorAnalytics.get('/dashboard',authMiddleware,getMyDashboard)
doctorAnalytics.get('/trends',authMiddleware,getMyTrends)
doctorAnalytics.get('/recent-surgeries',authMiddleware, getMyRecentSurgeries)
doctorAnalytics.get('/recent-surgeries',authMiddleware, getMyRecentSurgeries)
doctorAnalytics.get('/breakdown',authMiddleware, getMySurgeryBreakdown)
doctorAnalytics.get('/comparison',authMiddleware, getMyComparison)
doctorAnalytics.get('/quick-stats',authMiddleware, getMyQuickStats)



module.exports = doctorAnalytics