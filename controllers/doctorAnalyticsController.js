const Surgery = require('../models/surgerModel');
const User = require('../models/userModel');


exports.getMyDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { timeRange = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0);
    }

    // Parallel queries
    const [
      totalSurgeriesAllTime,
      totalSurgeriesInRange,
      completedSurgeries,
      incompleteSurgeries,
      completedAllTime,
      surgeryTypes,
      topProcedures
    ] = await Promise.all([
      // Total surgeries all time
      Surgery.countDocuments({ doctor: doctorId }),
      
      // Total in date range
      Surgery.countDocuments({ 
        doctor: doctorId,
        createdAt: { $gte: startDate }
      }),
      
      // Completed in range
      Surgery.countDocuments({
        doctor: doctorId,
        status: 'complete',
        createdAt: { $gte: startDate }
      }),
      
      // Incomplete in range
      Surgery.countDocuments({
        doctor: doctorId,
        status: 'incomplete',
        createdAt: { $gte: startDate }
      }),
      
      // Completed all time
      Surgery.countDocuments({
        doctor: doctorId,
        status: 'complete'
      }),
      
      // Surgery types distribution
      Surgery.aggregate([
        { 
          $match: { 
            doctor: doctorId,
            surgeryType: { $exists: true, $ne: null, $ne: '' }
          } 
        },
        { 
          $group: { 
            _id: '$surgeryType', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top procedures
      Surgery.aggregate([
        { $match: { doctor: doctorId } },
        { 
          $group: { 
            _id: '$procedure', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate completion rates
    const completionRateInRange = totalSurgeriesInRange > 0
      ? ((completedSurgeries / totalSurgeriesInRange) * 100).toFixed(1)
      : '0';

    const completionRateAllTime = totalSurgeriesAllTime > 0
      ? ((completedAllTime / totalSurgeriesAllTime) * 100).toFixed(1)
      : '0';

    // Format data
    const formattedSurgeryTypes = surgeryTypes.map(item => ({
      name: item._id,
      value: item.count
    }));

    const formattedProcedures = topProcedures.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSurgeriesAllTime,
          totalSurgeriesInRange,
          completedSurgeries,
          incompleteSurgeries,
          completionRateInRange: `${completionRateInRange}%`,
          completionRateAllTime: `${completionRateAllTime}%`
        },
        surgeryTypes: formattedSurgeryTypes,
        topProcedures: formattedProcedures,
        timeRange
      }
    });

  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};


exports.getMyTrends = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { period = 'month', count = 6 } = req.query;
    
    const periodsToShow = parseInt(count);
    const trends = [];
    const now = new Date();

    for (let i = periodsToShow - 1; i >= 0; i--) {
      let startDate = new Date();
      let endDate = new Date();
      let label;

      if (period === 'month') {
        startDate.setMonth(now.getMonth() - i);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        endDate.setMonth(now.getMonth() - i + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        
        label = startDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - 7);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        startDate = weekStart;
        endDate = weekEnd;
        label = `Week ${periodsToShow - i}`;
      }

      const [complete, incomplete, total] = await Promise.all([
        Surgery.countDocuments({
          doctor: doctorId,
          status: 'complete',
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Surgery.countDocuments({
          doctor: doctorId,
          status: 'incomplete',
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Surgery.countDocuments({
          doctor: doctorId,
          createdAt: { $gte: startDate, $lte: endDate }
        })
      ]);

      const completionRate = total > 0 
        ? ((complete / total) * 100).toFixed(1)
        : '0';

      trends.push({
        period: label,
        complete,
        incomplete,
        total,
        completionRate: parseFloat(completionRate)
      });
    }

    res.status(200).json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('Doctor trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trends',
      error: error.message
    });
  }
};


exports.getMyRecentSurgeries = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { limit = 10, status } = req.query;

    const query = { doctor: doctorId };
    if (status && ['complete', 'incomplete'].includes(status)) {
      query.status = status;
    }

    const recentSurgeries = await Surgery.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('surgeryId procedure surgeryType status date createdAt')
      .lean();

    res.status(200).json({
      success: true,
      count: recentSurgeries.length,
      data: recentSurgeries
    });

  } catch (error) {
    console.error('Recent surgeries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent surgeries',
      error: error.message
    });
  }
};


exports.getMySurgeryBreakdown = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const [statusBreakdown, procedureBreakdown, surgeryTypeBreakdown] = await Promise.all([
      // Status breakdown
      Surgery.aggregate([
        { $match: { doctor: doctorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Procedure breakdown
      Surgery.aggregate([
        { $match: { doctor: doctorId } },
        {
          $group: {
            _id: '$procedure',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 15 }
      ]),
      
      // Surgery type breakdown
      Surgery.aggregate([
        { 
          $match: { 
            doctor: doctorId,
            surgeryType: { $exists: true, $ne: null, $ne: '' }
          } 
        },
        {
          $group: {
            _id: '$surgeryType',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: statusBreakdown.map(item => ({
          status: item._id,
          count: item.count
        })),
        procedureBreakdown: procedureBreakdown.map(item => ({
          procedure: item._id,
          total: item.total,
          completed: item.completed,
          completionRate: ((item.completed / item.total) * 100).toFixed(1)
        })),
        surgeryTypeBreakdown: surgeryTypeBreakdown.map(item => ({
          surgeryType: item._id,
          total: item.total,
          completed: item.completed,
          completionRate: ((item.completed / item.total) * 100).toFixed(1)
        }))
      }
    });

  } catch (error) {
    console.error('Surgery breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch surgery breakdown',
      error: error.message
    });
  }
};


exports.getMyComparison = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Get doctor's specialty
    const doctor = await User.findById(doctorId).select('specialty');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get all doctors in same specialty
    const doctorsInSpecialty = await User.find({ 
      specialty: doctor.specialty,
      status: 'active'
    }).select('_id');

    const doctorIds = doctorsInSpecialty.map(d => d._id);

    // Get stats for all doctors in specialty
    const specialtyStats = await Surgery.aggregate([
      { $match: { doctor: { $in: doctorIds } } },
      {
        $group: {
          _id: '$doctor',
          totalSurgeries: { $sum: 1 },
          completedSurgeries: {
            $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalSurgeries: 1,
          completedSurgeries: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedSurgeries', '$totalSurgeries'] },
              100
            ]
          }
        }
      }
    ]);

    // Find my stats
    const myStats = specialtyStats.find(s => s._id.toString() === doctorId.toString());
    
    // Calculate averages
    const avgSurgeries = specialtyStats.length > 0
      ? (specialtyStats.reduce((sum, doc) => sum + doc.totalSurgeries, 0) / specialtyStats.length).toFixed(1)
      : '0';
    
    const avgCompletionRate = specialtyStats.length > 0
      ? (specialtyStats.reduce((sum, doc) => sum + doc.completionRate, 0) / specialtyStats.length).toFixed(1)
      : '0';

    // Calculate rankings
    const sortedBySurgeries = [...specialtyStats].sort((a, b) => b.totalSurgeries - a.totalSurgeries);
    const sortedByCompletion = [...specialtyStats].sort((a, b) => b.completionRate - a.completionRate);
    
    const myRankBySurgeries = sortedBySurgeries.findIndex(s => s._id.toString() === doctorId.toString()) + 1;
    const myRankByCompletion = sortedByCompletion.findIndex(s => s._id.toString() === doctorId.toString()) + 1;

    res.status(200).json({
      success: true,
      data: {
        myStats: {
          totalSurgeries: myStats?.totalSurgeries || 0,
          completedSurgeries: myStats?.completedSurgeries || 0,
          completionRate: myStats?.completionRate?.toFixed(1) || '0'
        },
        specialtyAverages: {
          avgSurgeries: parseFloat(avgSurgeries),
          avgCompletionRate: parseFloat(avgCompletionRate),
          totalDoctors: specialtyStats.length
        },
        rankings: {
          surgeryVolumeRank: myRankBySurgeries,
          completionRateRank: myRankByCompletion,
          outOf: specialtyStats.length
        },
        specialty: doctor.specialty
      }
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comparison data',
      error: error.message
    });
  }
};


exports.getMyQuickStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [
      todaySurgeries,
      thisWeekSurgeries,
      incompleteSurgeries,
      totalSurgeries,
      recentlyCompleted
    ] = await Promise.all([
      Surgery.countDocuments({
        doctor: doctorId,
        date: { $gte: today, $lt: tomorrow }
      }),
      
      Surgery.countDocuments({
        doctor: doctorId,
        date: { $gte: weekStart, $lt: weekEnd }
      }),
      
      Surgery.countDocuments({
        doctor: doctorId,
        status: 'incomplete'
      }),
      
      Surgery.countDocuments({
        doctor: doctorId
      }),
      
      Surgery.countDocuments({
        doctor: doctorId,
        status: 'complete',
        updatedAt: { $gte: weekStart }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        todaySurgeries,
        thisWeekSurgeries,
        incompleteSurgeries,
        totalSurgeries,
        recentlyCompleted
      }
    });

  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick stats',
      error: error.message
    });
  }
};