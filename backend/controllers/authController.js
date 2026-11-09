const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'farmer', phone, state, district, village, farmSize, landUnit, soilType, irrigationMethod } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: ['admin', 'farmer', 'expert'].includes(role) ? role : 'farmer',
      phone: phone ? phone.trim() : '',
      state: state || 'Telangana',
      district: district || 'Warangal',
      village: village || 'Ananthasagar'
    });

    // If farmer, initialize FarmerProfile
    if (user.role === 'farmer') {
      await FarmerProfile.create({
        userId: user._id,
        farmSize: farmSize ? Number(farmSize) : 5.0,
        landUnit: landUnit || 'acres',
        soilType: soilType || 'Red Sandy Loam',
        irrigationMethod: irrigationMethod || 'Drip Irrigation',
        farmingLocation: {
          state: user.state,
          district: user.district,
          village: user.village
        }
      });
    }

    // Log registration
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      module: 'AUTH',
      details: `New ${user.role} account registered: ${user.email}`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Agricultural Advisory Platform.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        district: user.district,
        village: user.village
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      module: 'AUTH',
      details: `${user.name} logged in successfully.`
    });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        district: user.district,
        village: user.village,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      farmerProfile: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password reset simulation
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    // In production, send email with reset link. For this demo, provide instant reset guidance.
    res.status(200).json({
      success: true,
      message: `Password reset instructions have been generated for ${email}. For academic demo purposes, you can use the default credentials or register a new account.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword
};
