const Crop = require('../models/Crop');
const ActivityLog = require('../models/ActivityLog');
const { generateCropAdvisories } = require('../services/advisoryEngine');
const CropAdvisories = require('../models/CropAdvisories');
const { getCurrentWeather } = require('../services/weatherService');

// @desc    Get crops (farmer gets own, admin/expert gets with filters)
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res, next) => {
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
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const crops = await Crop.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Private
const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (req.user.role === 'farmer' && crop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this crop' });
    }

    res.status(200).json({
      success: true,
      crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new crop
// @route   POST /api/crops
// @access  Private (Farmer, Admin)
const createCrop = async (req, res, next) => {
  try {
    const {
      cropName,
      cropCategory,
      variety,
      farmArea,
      areaUnit,
      sowingDate,
      expectedHarvestDate,
      growthStage,
      soilType,
      irrigationMethod,
      location,
      notes
    } = req.body;

    const crop = await Crop.create({
      userId: req.user._id,
      cropName,
      cropCategory: cropCategory || 'Cereals',
      variety: variety || 'Standard Hybrid',
      farmArea: Number(farmArea),
      areaUnit: areaUnit || 'acres',
      sowingDate: new Date(sowingDate),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      growthStage: growthStage || 'Vegetative',
      soilType: soilType || 'Red Sandy Loam',
      irrigationMethod: irrigationMethod || 'Drip Irrigation',
      location: location || {
        state: req.user.state,
        district: req.user.district,
        village: req.user.village
      },
      notes: notes || ''
    });

    // Auto-generate initial advisory based on live weather
    try {
      const weather = await getCurrentWeather({ city: req.user.district || 'Warangal' });
      const advisories = generateCropAdvisories({
        cropName: crop.cropName,
        growthStage: crop.growthStage,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall,
        windSpeed: weather.windSpeed,
        location: crop.location
      });

      for (const adv of advisories) {
        await CropAdvisories.create({
          userId: req.user._id,
          cropId: crop._id,
          cropName: crop.cropName,
          growthStage: crop.growthStage,
          advisoryTitle: adv.advisoryTitle,
          weatherCondition: adv.weatherCondition,
          description: adv.description,
          recommendedAction: adv.recommendedAction,
          priority: adv.priority,
          category: adv.category,
          triggeringWeather: adv.triggeringWeather
        });
      }
    } catch (advErr) {
      console.warn('[Advisory Generation Warning]', advErr.message);
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CROP_CREATED',
      module: 'CROPS',
      details: `Added new crop: ${crop.cropName} (${crop.farmArea} ${crop.areaUnit})`
    });

    res.status(201).json({
      success: true,
      message: 'Crop registered successfully! Agricultural advisories have been initialized.',
      crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a crop
// @route   PUT /api/crops/:id
// @access  Private (Farmer, Admin)
const updateCrop = async (req, res, next) => {
  try {
    let crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (req.user.role === 'farmer' && crop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this crop' });
    }

    const previousStage = crop.growthStage;

    crop.set(req.body);
    crop = await crop.save();

    // If growth stage changed, generate new advisories
    if (req.body.growthStage && req.body.growthStage !== previousStage) {
      try {
        const weather = await getCurrentWeather({ city: crop.location?.district || 'Warangal' });
        const advisories = generateCropAdvisories({
          cropName: crop.cropName,
          growthStage: crop.growthStage,
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          windSpeed: weather.windSpeed,
          location: crop.location
        });

        for (const adv of advisories) {
          await CropAdvisories.create({
            userId: crop.userId,
            cropId: crop._id,
            cropName: crop.cropName,
            growthStage: crop.growthStage,
            advisoryTitle: adv.advisoryTitle,
            weatherCondition: adv.weatherCondition,
            description: adv.description,
            recommendedAction: adv.recommendedAction,
            priority: adv.priority,
            category: adv.category,
            triggeringWeather: adv.triggeringWeather
          });
        }
      } catch (err) {
        // ignore
      }
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CROP_UPDATED',
      module: 'CROPS',
      details: `Updated crop details for: ${crop.cropName}`
    });

    res.status(200).json({
      success: true,
      message: 'Crop details updated successfully',
      crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
// @access  Private (Farmer, Admin)
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (req.user.role === 'farmer' && crop.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this crop' });
    }

    await crop.deleteOne();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CROP_DELETED',
      module: 'CROPS',
      details: `Deleted crop: ${crop.cropName} (${crop._id})`
    });

    res.status(200).json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
};
