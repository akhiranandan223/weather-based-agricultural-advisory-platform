const WeatherAlert = require('../models/WeatherAlert');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get active weather alerts
// @route   GET /api/alerts
// @access  Public (or Private)
const getAlerts = async (req, res, next) => {
  try {
    const { district, severity, isOfficial } = req.query;
    const filter = { isActive: true };

    if (district) {
      filter['location.district'] = new RegExp(district, 'i');
    }

    if (severity) {
      filter.severity = severity;
    }

    if (isOfficial !== undefined) {
      filter.isOfficial = isOfficial === 'true';
    }

    const alerts = await WeatherAlert.find(filter).sort({ createdAt: -1 });

    // Mark whether read by current user if logged in
    const processedAlerts = alerts.map(alert => {
      const obj = alert.toObject();
      obj.isRead = req.user ? alert.isReadBy.some(id => id.toString() === req.user._id.toString()) : false;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: processedAlerts.length,
      alerts: processedAlerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark an alert as read by the current user
// @route   PUT /api/alerts/:id/read
// @access  Private
const markAlertRead = async (req, res, next) => {
  try {
    const alert = await WeatherAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (!alert.isReadBy.includes(req.user._id)) {
      alert.isReadBy.push(req.user._id);
      await alert.save();
    }

    res.status(200).json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual official weather alert (Admin)
// @route   POST /api/alerts
// @access  Private (Admin)
const createAlert = async (req, res, next) => {
  try {
    const {
      alertTitle,
      alertType,
      description,
      recommendedPrecaution,
      severity,
      location,
      isOfficial = true
    } = req.body;

    const alert = await WeatherAlert.create({
      alertTitle,
      alertType,
      description,
      recommendedPrecaution: recommendedPrecaution || '',
      severity: severity || 'High',
      location: location || {
        city: 'Warangal',
        state: 'Telangana',
        district: 'Warangal',
        village: 'All Villages'
      },
      isOfficial: Boolean(isOfficial),
      thresholdTriggered: { metric: 'manual_admin', value: 0, threshold: 0 }
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ALERT_BROADCAST',
      module: 'ALERTS',
      details: `Published official alert: "${alert.alertTitle}" with severity ${alert.severity}`
    });

    res.status(201).json({
      success: true,
      message: 'Official weather alert published successfully to all agricultural dashboards.',
      alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss or deactivate alert
// @route   PUT /api/alerts/:id/deactivate
// @access  Private (Admin)
const deactivateAlert = async (req, res, next) => {
  try {
    const alert = await WeatherAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.isActive = false;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert deactivated successfully',
      alert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  markAlertRead,
  createAlert,
  deactivateAlert
};
