const express = require('express');
const router = express.Router();
const {
  getCurrentWeather,
  getForecast,
  getWeatherHistory,
  searchLocations
} = require('../controllers/weatherController');

router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);
router.get('/history', getWeatherHistory);
router.get('/locations', searchLocations);

module.exports = router;
