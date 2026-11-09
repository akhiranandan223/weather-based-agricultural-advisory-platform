const FarmerQuery = require('../models/FarmerQuery');
const ExpertResponse = require('../models/ExpertResponse');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Get all queries for agriculture experts with filtering
// @route   GET /api/expert/queries
// @access  Private (Expert, Admin)
const getExpertQueries = async (req, res, next) => {
  try {
    const { status, cropName, urgency, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (cropName && cropName !== 'All') {
      filter.cropName = new RegExp(cropName, 'i');
    }

    if (urgency && urgency !== 'All') {
      filter.urgency = urgency;
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { problemDescription: new RegExp(search, 'i') },
        { farmerName: new RegExp(search, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await FarmerQuery.countDocuments(filter);
    const queries = await FarmerQuery.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('farmerId', 'name email phone state district village')
      .populate('cropId', 'cropName cropCategory farmArea sowingDate growthStage');

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      queries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit expert response to a farmer query
// @route   POST /api/expert/responses
// @access  Private (Expert, Admin)
const submitExpertResponse = async (req, res, next) => {
  try {
    const {
      queryId,
      message,
      recommendedAction = '',
      weatherConsiderations = '',
      status = 'Answered'
    } = req.body;

    if (!queryId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Query ID and response message are required.'
      });
    }

    const query = await FarmerQuery.findById(queryId);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Farmer query not found.' });
    }

    const responseItem = {
      expertId: req.user._id,
      expertName: req.user.name,
      expertQualification: 'Agricultural Extension Scientist',
      message: message.trim(),
      recommendedAction: recommendedAction.trim(),
      weatherConsiderations: weatherConsiderations.trim(),
      createdAt: new Date()
    };

    query.responses.push(responseItem);
    query.status = status;
    await query.save();

    // Also persist in the ExpertResponse collection
    await ExpertResponse.create({
      queryId: query._id,
      expertId: req.user._id,
      expertName: req.user.name,
      recommendation: message.trim(),
      recommendedAction: recommendedAction.trim(),
      weatherConsiderations: weatherConsiderations.trim(),
      resolvedStatus: status
    });

    // Notify the farmer
    await Notification.create({
      userId: query.farmerId,
      title: `Expert Response: ${query.title}`,
      message: `${req.user.name} provided a response to your query regarding ${query.cropName}.`,
      type: 'query',
      link: `/queries/${query._id}`
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'EXPERT_REPLIED',
      module: 'QUERIES',
      details: `Expert replied to query: "${query.title}" (Status: ${status})`
    });

    res.status(200).json({
      success: true,
      message: 'Expert advisory response submitted successfully and notified to the farmer.',
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expert overview metrics & statistics
// @route   GET /api/expert/stats
// @access  Private (Expert, Admin)
const getExpertStats = async (req, res, next) => {
  try {
    const totalQueries = await FarmerQuery.countDocuments();
    const pendingQueries = await FarmerQuery.countDocuments({ status: 'Pending' });
    const inProgressQueries = await FarmerQuery.countDocuments({ status: 'In Progress' });
    const answeredQueries = await FarmerQuery.countDocuments({ status: 'Answered' });
    const closedQueries = await FarmerQuery.countDocuments({ status: 'Closed' });

    // Crop distribution aggregation
    const cropStats = await FarmerQuery.aggregate([
      { $group: { _id: '$cropName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Location distribution
    const locationStats = await FarmerQuery.aggregate([
      { $group: { _id: '$farmingLocation.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalQueries,
        pendingQueries,
        inProgressQueries,
        answeredQueries,
        closedQueries,
        responseRate: totalQueries > 0 ? Math.round(((answeredQueries + closedQueries) / totalQueries) * 100) : 0,
        cropStats,
        locationStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpertQueries,
  submitExpertResponse,
  getExpertStats
};
