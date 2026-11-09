const WeatherHistory = require('../models/WeatherHistory');
const WeatherForecast = require('../models/WeatherForecast');
const CropAdvisories = require('../models/CropAdvisories');
const FarmerQuery = require('../models/FarmerQuery');
const { getForecast } = require('../services/weatherService');

// Helper to format CSV row
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const stringVal = String(val).replace(/"/g, '""');
  return `"${stringVal}"`;
};

// 1. WEATHER HISTORY REPORT
// @route GET /api/reports/weather-history
const getWeatherHistoryReport = async (req, res, next) => {
  try {
    const { city, startDate, endDate, format = 'json' } = req.query;
    const filter = {};

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (startDate || endDate) {
      filter.recordedAt = {};
      if (startDate) filter.recordedAt.$gte = new Date(startDate);
      if (endDate) filter.recordedAt.$lte = new Date(endDate);
    }

    const records = await WeatherHistory.find(filter).sort({ recordedAt: -1 }).limit(200);

    if (format === 'csv') {
      const headers = ['Date & Time', 'City', 'State', 'Temperature (°C)', 'Feels Like (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Wind Speed (km/h)', 'Rainfall (mm)', 'Condition', 'Description', 'Data Source'];
      const rows = records.map(r => [
        escapeCSV(new Date(r.recordedAt).toLocaleString()),
        escapeCSV(r.location.city),
        escapeCSV(r.location.state),
        escapeCSV(r.temperature),
        escapeCSV(r.feelsLike),
        escapeCSV(r.humidity),
        escapeCSV(r.pressure),
        escapeCSV(r.windSpeed),
        escapeCSV(r.rainfall),
        escapeCSV(r.condition),
        escapeCSV(r.description),
        escapeCSV(r.dataSource)
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=Weather_History_Report.csv');
      return res.status(200).send(csvContent);
    }

    res.status(200).json({
      success: true,
      reportName: 'Weather History Report',
      generatedAt: new Date().toISOString(),
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// 2. FORECAST SUMMARY REPORT
// @route GET /api/reports/forecast-summary
const getForecastSummaryReport = async (req, res, next) => {
  try {
    const { city = 'Warangal', format = 'json' } = req.query;
    const forecastResult = await getForecast({ city });

    // Group forecast items by calendar date
    const dailyMap = {};
    forecastResult.forecasts.forEach(item => {
      const dateKey = item.dateTime.split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          temps: [],
          humidities: [],
          rainProbs: [],
          rainAmounts: [],
          windSpeeds: [],
          conditions: []
        };
      }
      dailyMap[dateKey].temps.push(item.temperature);
      dailyMap[dateKey].humidities.push(item.humidity);
      dailyMap[dateKey].rainProbs.push(item.rainProbability);
      dailyMap[dateKey].rainAmounts.push(item.rainAmount);
      dailyMap[dateKey].windSpeeds.push(item.windSpeed);
      dailyMap[dateKey].conditions.push(item.condition);
    });

    const summaryList = Object.values(dailyMap).map(d => {
      const minTemp = Math.min(...d.temps);
      const maxTemp = Math.max(...d.temps);
      const avgHumidity = Math.round(d.humidities.reduce((a, b) => a + b, 0) / d.humidities.length);
      const maxRainProb = Math.max(...d.rainProbs);
      const totalRain = Math.round(d.rainAmounts.reduce((a, b) => a + b, 0) * 10) / 10;
      const maxWind = Math.max(...d.windSpeeds);

      return {
        date: d.date,
        forecastPeriod: `${d.date} (Full Day)`,
        minTemperature: minTemp,
        maxTemperature: maxTemp,
        averageHumidity: avgHumidity,
        expectedRainfall: totalRain,
        rainProbability: maxRainProb,
        maxWindSpeed: maxWind,
        forecastSummary: maxRainProb > 50 ? 'Showers expected' : avgHumidity > 70 ? 'Cloudy & Humid' : 'Clear & Dry'
      };
    });

    if (format === 'csv') {
      const headers = ['Date', 'Period', 'Min Temp (°C)', 'Max Temp (°C)', 'Avg Humidity (%)', 'Expected Rain (mm)', 'Rain Chance (%)', 'Max Wind (km/h)', 'Forecast Summary'];
      const rows = summaryList.map(s => [
        escapeCSV(s.date),
        escapeCSV(s.forecastPeriod),
        escapeCSV(s.minTemperature),
        escapeCSV(s.maxTemperature),
        escapeCSV(s.averageHumidity),
        escapeCSV(s.expectedRainfall),
        escapeCSV(s.rainProbability),
        escapeCSV(s.maxWindSpeed),
        escapeCSV(s.forecastSummary)
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=Forecast_Summary_Report.csv');
      return res.status(200).send(csvContent);
    }

    res.status(200).json({
      success: true,
      reportName: 'Five-Day Weather Forecast Summary Report',
      city: forecastResult.city,
      generatedAt: new Date().toISOString(),
      dataSource: forecastResult.dataSource,
      summary: summaryList,
      rawForecasts: forecastResult.forecasts
    });
  } catch (error) {
    next(error);
  }
};

// 3. CROP ADVISORY REPORT
// @route GET /api/reports/crop-advisory
const getCropAdvisoryReport = async (req, res, next) => {
  try {
    const { cropName, priority, startDate, endDate, format = 'json' } = req.query;
    const filter = {};

    if (req.user && req.user.role === 'farmer') {
      filter.userId = req.user._id;
    }

    if (cropName) filter.cropName = new RegExp(cropName, 'i');
    if (priority) filter.priority = priority;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const advisories = await CropAdvisories.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone state district village')
      .populate('cropId', 'cropName farmArea growthStage');

    if (format === 'csv') {
      const headers = ['Date', 'Farmer Name', 'District', 'Crop', 'Growth Stage', 'Advisory Title', 'Weather Condition', 'Recommended Action', 'Priority'];
      const rows = advisories.map(a => [
        escapeCSV(new Date(a.createdAt).toLocaleDateString()),
        escapeCSV(a.userId?.name || 'Farmer'),
        escapeCSV(a.userId?.district || 'Warangal'),
        escapeCSV(a.cropName),
        escapeCSV(a.growthStage),
        escapeCSV(a.advisoryTitle),
        escapeCSV(a.weatherCondition),
        escapeCSV(a.recommendedAction),
        escapeCSV(a.priority)
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=Crop_Advisory_Report.csv');
      return res.status(200).send(csvContent);
    }

    res.status(200).json({
      success: true,
      reportName: 'Crop-Specific Advisory Report',
      generatedAt: new Date().toISOString(),
      count: advisories.length,
      data: advisories
    });
  } catch (error) {
    next(error);
  }
};

// 4. FARMER QUERY REPORT
// @route GET /api/reports/farmer-queries
const getFarmerQueryReport = async (req, res, next) => {
  try {
    const { status, cropName, urgency, format = 'json' } = req.query;
    const filter = {};

    if (req.user && req.user.role === 'farmer') {
      filter.farmerId = req.user._id;
    }

    if (status) filter.status = status;
    if (cropName) filter.cropName = new RegExp(cropName, 'i');
    if (urgency) filter.urgency = urgency;

    const queries = await FarmerQuery.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name email phone state district village');

    if (format === 'csv') {
      const headers = ['Query Date', 'Farmer Name', 'Phone', 'District', 'Crop', 'Title', 'Problem Description', 'Urgency', 'Status', 'Latest Expert Response'];
      const rows = queries.map(q => {
        const latestResponse = q.responses && q.responses.length > 0 ? q.responses[q.responses.length - 1].message : 'Pending Response';
        return [
          escapeCSV(new Date(q.createdAt).toLocaleDateString()),
          escapeCSV(q.farmerName || q.farmerId?.name),
          escapeCSV(q.farmerPhone || q.farmerId?.phone),
          escapeCSV(q.farmingLocation?.district || q.farmerId?.district),
          escapeCSV(q.cropName),
          escapeCSV(q.title),
          escapeCSV(q.problemDescription),
          escapeCSV(q.urgency),
          escapeCSV(q.status),
          escapeCSV(latestResponse)
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=Farmer_Query_Report.csv');
      return res.status(200).send(csvContent);
    }

    res.status(200).json({
      success: true,
      reportName: 'Farmer Advisory Query Report',
      generatedAt: new Date().toISOString(),
      count: queries.length,
      data: queries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeatherHistoryReport,
  getForecastSummaryReport,
  getCropAdvisoryReport,
  getFarmerQueryReport
};
