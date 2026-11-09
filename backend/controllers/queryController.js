const FarmerQuery = require('../models/FarmerQuery');
const Crop = require('../models/Crop');
const ActivityLog = require('../models/ActivityLog');
const { getCurrentWeather } = require('../services/weatherService');

// @desc    Submit a new query to agriculture experts
// @route   POST /api/queries
// @access  Private (Farmer)
const submitQuery = async (req, res, next) => {
  try {
    const {
      title,
      cropId,
      cropName,
      growthStage,
      problemDescription,
      urgency = 'Medium',
      farmingLocation
    } = req.body;

    let selectedCropName = cropName;
    let selectedGrowthStage = growthStage;

    if (cropId) {
      const crop = await Crop.findById(cropId);
      if (crop) {
        selectedCropName = crop.cropName;
        selectedGrowthStage = crop.growthStage;
      }
    }

    // Attach latest weather context
    let weatherContext = {};
    try {
      const weather = await getCurrentWeather({ city: req.user.district || 'Warangal' });
      weatherContext = {
        temperature: weather.temperature,
        humidity: weather.humidity,
        condition: weather.condition,
        recordedAt: new Date()
      };
    } catch (err) {
      // ignore
    }

    const query = await FarmerQuery.create({
      farmerId: req.user._id,
      farmerName: req.user.name,
      farmerPhone: req.user.phone || '',
      cropId: cropId || null,
      cropName: selectedCropName || 'General / Other',
      growthStage: selectedGrowthStage || 'Vegetative',
      title: title.trim(),
      problemDescription: problemDescription.trim(),
      urgency,
      farmingLocation: farmingLocation || {
        state: req.user.state,
        district: req.user.district,
        village: req.user.village
      },
      weatherContext,
      status: 'Pending'
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'QUERY_SUBMITTED',
      module: 'QUERIES',
      details: `Farmer submitted query: "${query.title}" for crop ${query.cropName}`
    });

    res.status(201).json({
      success: true,
      message: 'Your query has been submitted to agricultural extension experts for review.',
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queries for farmer (or all if admin)
// @route   GET /api/queries
// @access  Private
const getQueries = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'farmer') {
      filter.farmerId = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.cropName) {
      filter.cropName = new RegExp(req.query.cropName, 'i');
    }

    if (req.query.urgency) {
      filter.urgency = req.query.urgency;
    }

    const queries = await FarmerQuery.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name email phone state district village')
      .populate('cropId', 'cropName farmArea sowingDate growthStage');

    res.status(200).json({
      success: true,
      count: queries.length,
      queries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single query by ID
// @route   GET /api/queries/:id
// @access  Private
const getQueryById = async (req, res, next) => {
  try {
    const query = await FarmerQuery.findById(req.params.id)
      .populate('farmerId', 'name email phone state district village')
      .populate('cropId');

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    if (req.user.role === 'farmer' && query.farmerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this query' });
    }

    res.status(200).json({
      success: true,
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update query status
// @route   PUT /api/queries/:id/status
// @access  Private (Farmer, Expert, Admin)
const updateQueryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const query = await FarmerQuery.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    query.status = status;
    await query.save();

    res.status(200).json({
      success: true,
      message: `Query status updated to ${status}`,
      query
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuery,
  getQueries,
  getQueryById,
  updateQueryStatus
};
