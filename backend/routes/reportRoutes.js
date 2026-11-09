const express = require('express');
const router = express.Router();
const {
  getWeatherHistoryReport,
  getForecastSummaryReport,
  getCropAdvisoryReport,
  getFarmerQueryReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Weather history and forecast summaries are open or authenticated; advisories and queries use protect
router.get('/weather-history', getWeatherHistoryReport);
router.get('/forecast-summary', getForecastSummaryReport);
router.get('/crop-advisory', protect, getCropAdvisoryReport);
router.get('/farmer-queries', protect, getFarmerQueryReport);

module.exports = router;
