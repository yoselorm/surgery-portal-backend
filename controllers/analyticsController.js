const Surgery = require('../models/surgerModel');
const User = require('../models/userModel');


exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query; 
    
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

    const [
      totalSurgeries,
      completedSurgeries,
      incompleteSurgeries,
      totalDoctors,
      activeDoctors,
      surgeryTypeStats,
      procedureStats
    ] = await Promise.all([
      // Total surgeries in date range
      Surgery.countDocuments({ 
        createdAt: { $gte: startDate } 
      }),
      
      // Completed surgeries
      Surgery.countDocuments({ 
        status: 'complete',
        createdAt: { $gte: startDate }
      }),
      
      // Incomplete surgeries
      Surgery.countDocuments({ 
        status: 'incomplete',
        createdAt: { $gte: startDate }
      }),
      
      // Total doctors in system
      User.countDocuments(),
      
      // Active doctors only
      User.countDocuments({ 
        status: 'active' 
      }),
      
      // Surgery types distribution (top 10)
      Surgery.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
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
      
      // Top procedures (top 10)
      Surgery.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate } 
          } 
        },
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



    // Calculate completion rate
    const completionRate = totalSurgeries > 0 
      ? ((completedSurgeries / totalSurgeries) * 100).toFixed(1)
      : '0';

    // Format data for frontend
    const formattedSurgeryTypes = surgeryTypeStats.map(item => ({
      name: item._id,
      value: item.count
    }));

    const formattedProcedures = procedureStats.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSurgeries,
          completedSurgeries,
          incompleteSurgeries,
          totalDoctors,
          activeDoctors,
          completionRate: `${completionRate}%`
        },
        surgeryTypes: formattedSurgeryTypes,
        topProcedures: formattedProcedures,
        timeRange
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
};


exports.getSurgeryTrends = async (req, res) => {
  try {
    const { period = 'month', count = 6 } = req.query;
    
    const periodsToShow = parseInt(count);
    const trends = [];
    const now = new Date();

    for (let i = periodsToShow - 1; i >= 0; i--) {
      let startDate = new Date();
      let endDate = new Date();
      let label;

      if (period === 'month') {
        // Monthly trends
        startDate.setMonth(now.getMonth() - i);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        endDate.setMonth(now.getMonth() - i + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        
        label = startDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else {
        // Weekly trends
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
          status: 'complete',
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Surgery.countDocuments({
          status: 'incomplete',
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Surgery.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        })
      ]);

      trends.push({
        period: label,
        complete,
        incomplete,
        total
      });
    }

    res.status(200).json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('Surgery trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch surgery trends',
      error: error.message
    });
  }
};


exports.getDoctorPerformance = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'totalSurgeries' } = req.query;

    const performance = await Surgery.aggregate([
      {
        $group: {
          _id: '$doctor',
          totalSurgeries: { $sum: 1 },
          completedSurgeries: {
            $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
          },
          incompleteSurgeries: {
            $sum: { $cond: [{ $eq: ['$status', 'incomplete'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: {
          path: '$doctorInfo',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          _id: 0,
          doctorId: '$doctorInfo._id',
          doctorIdentifier: '$doctorInfo.doctorId',
          fullname: '$doctorInfo.fullname',
          specialty: '$doctorInfo.specialty',
          country: '$doctorInfo.country',
          city: '$doctorInfo.city',
          status: '$doctorInfo.status',
          totalSurgeries: 1,
          completedSurgeries: 1,
          incompleteSurgeries: 1,
          completionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$completedSurgeries', '$totalSurgeries'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      {
        $sort: { [sortBy]: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.status(200).json({
      success: true,
      count: performance.length,
      data: performance
    });

  } catch (error) {
    console.error('Doctor performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor performance',
      error: error.message
    });
  }
};


exports.getLocationStats = async (req, res) => {
  try {
    // Location distribution (based on doctor's location)
    const locationDistribution = await Surgery.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: '$doctorInfo'
      },
      {
        $group: {
          _id: {
            country: '$doctorInfo.country',
          },
          totalSurgeries: { $sum: 1 },
          completedSurgeries: {
            $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          totalSurgeries: 1,
          completedSurgeries: 1,
          completionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$completedSurgeries', '$totalSurgeries'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      {
        $sort: { totalSurgeries: -1 }
      },
      {
        $limit: 15
      }
    ]);

    res.status(200).json({
      success: true,
      count: locationDistribution.length,
      data: locationDistribution
    });

  } catch (error) {
    console.error('Location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics',
      error: error.message
    });
  }
};



exports.getRecentSurgeries = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentSurgeries = await Surgery.find()
      .populate('doctor', 'doctorId specialty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('surgeryId procedure status date createdAt')
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