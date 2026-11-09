const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Crop = require('../models/Crop');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get farmer profile & farm details
// @route   GET /api/farmers/profile
// @access  Private (Farmer, Admin, Expert)
const getProfile = async (req, res, next) => {
  try {
    const userId = req.query.farmerId || req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    let profile = await FarmerProfile.findOne({ userId });
    if (!profile && user.role === 'farmer') {
      profile = await FarmerProfile.create({
        userId: user._id,
        farmSize: 5.0,
        landUnit: 'acres',
        soilType: 'Red Sandy Loam',
        irrigationMethod: 'Drip Irrigation',
        farmingLocation: {
          state: user.state,
          district: user.district,
          village: user.village
        }
      });
    }

    const crops = await Crop.find({ userId, status: 'Active' });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        district: user.district,
        village: user.village
      },
      farmerProfile: profile,
      crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farmer personal details, location & farm info
// @route   PUT /api/farmers/profile
// @access  Private (Farmer, Admin)
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      name,
      phone,
      state,
      district,
      village,
      farmSize,
      landUnit,
      soilType,
      irrigationMethod,
      experienceYears,
      notes
    } = req.body;

    // Update user record
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (state) user.state = state.trim();
    if (district) user.district = district.trim();
    if (village) user.village = village.trim();
    await user.save();

    // Update or create profile record
    let profile = await FarmerProfile.findOne({ userId });
    if (!profile) {
      profile = new FarmerProfile({ userId });
    }

    if (farmSize !== undefined) profile.farmSize = Number(farmSize);
    if (landUnit) profile.landUnit = landUnit;
    if (soilType) profile.soilType = soilType;
    if (irrigationMethod) profile.irrigationMethod = irrigationMethod;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (notes !== undefined) profile.notes = notes;

    profile.farmingLocation = {
      state: user.state,
      district: user.district,
      village: user.village
    };

    await profile.save();

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'PROFILE_UPDATED',
      module: 'AUTH',
      details: `${user.name} updated farming profile and location.`
    });

    res.status(200).json({
      success: true,
      message: 'Farmer profile and farming details updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        district: user.district,
        village: user.village
      },
      farmerProfile: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered farmers (Admin/Expert)
// @route   GET /api/farmers
// @access  Private (Admin, Expert)
const getAllFarmers = async (req, res, next) => {
  try {
    const { district, state, search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'farmer' };

    if (district) filter.district = new RegExp(district, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { village: new RegExp(search, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const farmers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      farmers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllFarmers
};
