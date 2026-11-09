const { getCurrentWeather: fetchWeather, getForecast: fetchForecast, CITY_COORDINATES } = require('../services/weatherService');
const { evaluateWeatherAlerts } = require('../services/alertService');
const WeatherHistory = require('../models/WeatherHistory');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get Current Live Weather
// @route   GET /api/weather/current
// @access  Public (or Private)
const getCurrentWeather = async (req, res, next) => {
  try {
    const { city, state, lat, lon } = req.query;
    const weather = await fetchWeather({ city, state, lat, lon });

    // Evaluate weather for alerts
    try {
      await evaluateWeatherAlerts(weather);
    } catch (alertErr) {
      console.warn('[Alert Evaluation Warning]', alertErr.message);
    }

    res.status(200).json({
      success: true,
      weather
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 5-Day / 3-Hour Forecast
// @route   GET /api/weather/forecast
// @access  Public (or Private)
const getForecast = async (req, res, next) => {
  try {
    const { city, state, lat, lon } = req.query;
    const forecastData = await fetchForecast({ city, state, lat, lon });

    res.status(200).json({
      success: true,
      forecast: forecastData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Historical Weather Records
// @route   GET /api/weather/history
// @access  Private (or Public)
const getWeatherHistory = async (req, res, next) => {
  try {
    const { city, startDate, endDate, limit = 50 } = req.query;
    const filter = {};

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (startDate || endDate) {
      filter.recordedAt = {};
      if (startDate) filter.recordedAt.$gte = new Date(startDate);
      if (endDate) filter.recordedAt.$lte = new Date(endDate);
    }

    const records = await WeatherHistory.find(filter)
      .sort({ recordedAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: records.length,
      history: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Coordinates / Agricultural Locations
// @route   GET /api/weather/locations
// @access  Public
const searchLocations = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const query = q.toLowerCase().trim();

    const matched = Object.entries(CITY_COORDINATES)
      .filter(([key]) => key.includes(query))
      .map(([name, data]) => ({
        city: name.charAt(0).toUpperCase() + name.slice(1),
        state: data.state,
        country: data.country,
        lat: data.lat,
        lon: data.lon
      }));

    res.status(200).json({
      success: true,
      locations: matched
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getWeatherHistory,
  searchLocations
};
