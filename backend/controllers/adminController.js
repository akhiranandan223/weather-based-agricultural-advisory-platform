const User = require('../models/User');
const Crop = require('../models/Crop');
const CropAdvisories = require('../models/CropAdvisories');
const FarmerQuery = require('../models/FarmerQuery');
const WeatherAlert = require('../models/WeatherAlert');
const WeatherHistory = require('../models/WeatherHistory');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get complete admin dashboard overview stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalExperts = await User.countDocuments({ role: 'expert' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCrops = await Crop.countDocuments();
    const totalAdvisories = await CropAdvisories.countDocuments();
    const totalQueries = await FarmerQuery.countDocuments();
    const pendingQueries = await FarmerQuery.countDocuments({ status: 'Pending' });
    const activeAlerts = await WeatherAlert.countDocuments({ isActive: true });
    const weatherApiCount = await WeatherHistory.countDocuments();

    // Recent user registrations
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent system activity logs
    const recentLogs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFarmers,
        totalExperts,
        totalAdmins,
        totalCrops,
        totalAdvisories,
        totalQueries,
        pendingQueries,
        activeAlerts,
        weatherApiCount
      },
      recentUsers,
      recentLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user accounts with search, role filtering, pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { district: new RegExp(search, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or deactivate user account
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, name, phone, district, state } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (district) user.district = district.trim();
    if (state) user.state = state.trim();

    await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ADMIN_USER_UPDATE',
      module: 'ADMIN',
      details: `Admin updated account: ${user.email} (Active: ${user.isActive}, Role: ${user.role})`
    });

    res.status(200).json({
      success: true,
      message: 'User account updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        district: user.district,
        state: user.state
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system analytics charts data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Crop Distribution
    const cropDistribution = await Crop.aggregate([
      { $group: { _id: '$cropName', count: { $sum: 1 }, totalArea: { $sum: '$farmArea' } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Query Status Breakdown
    const queryBreakdown = await FarmerQuery.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Advisory Priority Distribution
    const advisoryPriority = await CropAdvisories.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // 4. District-wise farmer distribution
    const districtDistribution = await User.aggregate([
      { $match: { role: 'farmer' } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        cropDistribution,
        queryBreakdown,
        advisoryPriority,
        districtDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
const getSystemLogs = async (req, res, next) => {
  try {
    const { module: mod, limit = 50 } = req.query;
    const filter = {};
    if (mod) filter.module = mod;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  getAnalytics,
  getSystemLogs
};
