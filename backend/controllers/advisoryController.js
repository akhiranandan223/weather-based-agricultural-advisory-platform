const CropAdvisories = require('../models/CropAdvisories');
const Crop = require('../models/Crop');
const { getCurrentWeather } = require('../services/weatherService');
const { generateCropAdvisories } = require('../services/advisoryEngine');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get Advisories
// @route   GET /api/advisories
// @access  Private
const getAdvisories = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'farmer') {
      filter.userId = req.user._id;
    } else if (req.query.farmerId) {
      filter.userId = req.query.farmerId;
    }

    if (req.query.cropName) {
      filter.cropName = new RegExp(req.query.cropName, 'i');
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const advisories = await CropAdvisories.find(filter)
      .sort({ createdAt: -1 })
      .populate('cropId', 'cropName cropCategory farmArea sowingDate growthStage');

    res.status(200).json({
      success: true,
      count: advisories.length,
      advisories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Generation of Real-Time Crop Advisories
// @route   POST /api/advisories/generate
// @access  Private
const generateAdvisory = async (req, res, next) => {
  try {
    const { cropId, city } = req.body;
    let cropsToProcess = [];

    if (cropId) {
      const singleCrop = await Crop.findById(cropId);
      if (singleCrop) cropsToProcess.push(singleCrop);
    } else if (req.user.role === 'farmer') {
      cropsToProcess = await Crop.find({ userId: req.user._id, status: 'Active' });
    } else {
      cropsToProcess = await Crop.find({ status: 'Active' }).limit(10);
    }

    if (cropsToProcess.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No registered crops found to generate advisories. Please add a crop first.'
      });
    }

    const targetCity = city || req.user.district || 'Warangal';
    const weather = await getCurrentWeather({ city: targetCity });

    const newAdvisories = [];

    for (const crop of cropsToProcess) {
      const generated = generateCropAdvisories({
        cropName: crop.cropName,
        growthStage: crop.growthStage,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
        windSpeed: weather.windSpeed,
        location: crop.location
      });

      for (const item of generated) {
        const saved = await CropAdvisories.create({
          userId: crop.userId || req.user._id,
          cropId: crop._id,
          cropName: crop.cropName,
          growthStage: crop.growthStage,
          advisoryTitle: item.advisoryTitle,
          weatherCondition: item.weatherCondition,
          description: item.description,
          recommendedAction: item.recommendedAction,
          priority: item.priority,
          category: item.category,
          triggeringWeather: item.triggeringWeather
        });
        newAdvisories.push(saved);
      }
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ADVISORY_GENERATED',
      module: 'ADVISORY',
      details: `Generated ${newAdvisories.length} advisory records based on ${weather.temperature}°C, ${weather.humidity}% humidity in ${targetCity}.`
    });

    res.status(201).json({
      success: true,
      message: `Successfully evaluated weather and generated ${newAdvisories.length} new advisory items.`,
      weatherSnapshot: {
        city: targetCity,
        temperature: weather.temperature,
        humidity: weather.humidity,
        condition: weather.condition,
        dataSource: weather.dataSource
      },
      advisories: newAdvisories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Advisory History
// @route   GET /api/advisories/history
// @access  Private
const getAdvisoryHistory = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'farmer') {
      filter.userId = req.user._id;
    }

    if (req.query.cropName) {
      filter.cropName = new RegExp(req.query.cropName, 'i');
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const total = await CropAdvisories.countDocuments(filter);
    const advisories = await CropAdvisories.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      advisories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge or update advisory status
// @route   PUT /api/advisories/:id/status
// @access  Private
const updateAdvisoryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const advisory = await CropAdvisories.findById(req.params.id);

    if (!advisory) {
      return res.status(404).json({ success: false, message: 'Advisory not found' });
    }

    if (req.user.role === 'farmer' && advisory.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    advisory.status = status || 'Acknowledged';
    await advisory.save();

    res.status(200).json({
      success: true,
      message: `Advisory status updated to ${advisory.status}`,
      advisory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdvisories,
  generateAdvisory,
  getAdvisoryHistory,
  updateAdvisoryStatus
};
