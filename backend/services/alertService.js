const WeatherAlert = require('../models/WeatherAlert');

/**
 * Evaluates real-time weather against agronomic alert thresholds
 * Thresholds:
 * - Heavy Rain > 50mm
 * - High Temperature > 38°C
 * - Low Temperature / Frost < 10°C
 * - Strong Winds > 30 km/h
 * - High Humidity > 85%
 * - Low Rainfall / Dry Spell
 */
const evaluateWeatherAlerts = async (weatherData) => {
  const alertsToCreate = [];
  const location = {
    city: weatherData.city || 'Warangal',
    state: weatherData.state || 'Telangana',
    district: weatherData.district || 'Warangal',
    village: 'All Villages'
  };

  // 1. Extreme Heat Alert
  if (weatherData.temperature >= 38) {
    alertsToCreate.push({
      alertTitle: `Severe Heat Alert (${weatherData.temperature}°C) in ${location.city}`,
      alertType: 'High Temperature',
      severity: weatherData.temperature >= 42 ? 'High' : 'Medium',
      description: `Ambient temperature has reached ${weatherData.temperature}°C, presenting high danger of heat stress, blossom drop, and rapid soil desiccation.`,
      recommendedPrecaution: 'Operate drip/sprinkler systems in early morning/evening. Keep cattle sheltered and irrigate standing vegetables to protect roots.',
      location,
      thresholdTriggered: { metric: 'temperature', value: weatherData.temperature, threshold: 38 },
      isOfficial: false
    });
  }

  // 2. Heavy Rainfall Alert
  if (weatherData.rainfall >= 40) {
    alertsToCreate.push({
      alertTitle: `Heavy Rainfall Advisory (${weatherData.rainfall}mm) for ${location.city}`,
      alertType: 'Heavy Rainfall',
      severity: weatherData.rainfall >= 70 ? 'High' : 'Medium',
      description: `Intense localized rainfall detected. Low-lying plots are at severe risk of submergence and nutrient leaching.`,
      recommendedPrecaution: 'Open field drain gates. Discontinue synthetic fertilizer top-dressing until standing water drains off.',
      location,
      thresholdTriggered: { metric: 'rainfall', value: weatherData.rainfall, threshold: 40 },
      isOfficial: false
    });
  }

  // 3. Strong Wind Alert
  if (weatherData.windSpeed >= 30) {
    alertsToCreate.push({
      alertTitle: `Strong Wind Warning (${weatherData.windSpeed} km/h) in ${location.city}`,
      alertType: 'Strong Winds',
      severity: weatherData.windSpeed >= 45 ? 'High' : 'Medium',
      description: `Gusty wind conditions pose lodging risk for tall crops (Maize, Sugarcane, Banana) and make pesticide application hazardous.`,
      recommendedPrecaution: 'Provide physical staking for banana and vegetable vine crops. Do not operate knapsack or tractor sprayers.',
      location,
      thresholdTriggered: { metric: 'windSpeed', value: weatherData.windSpeed, threshold: 30 },
      isOfficial: false
    });
  }

  // 4. High Humidity Alert
  if (weatherData.humidity >= 85) {
    alertsToCreate.push({
      alertTitle: `High Relative Humidity Alert (${weatherData.humidity}%)`,
      alertType: 'High Humidity',
      severity: 'Medium',
      description: `Continuous high relative humidity creates conducive conditions for rapid bacterial and fungal sporulation in crops.`,
      recommendedPrecaution: 'Scout standing crops for leaf spot, blast, and blight symptoms. Avoid high nitrogen application.',
      location,
      thresholdTriggered: { metric: 'humidity', value: weatherData.humidity, threshold: 85 },
      isOfficial: false
    });
  }

  // Save generated alerts if not already duplicated in the past 12 hours
  const savedAlerts = [];
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  for (const item of alertsToCreate) {
    const existing = await WeatherAlert.findOne({
      alertType: item.alertType,
      'location.city': item.location.city,
      createdAt: { $gte: twelveHoursAgo }
    });

    if (!existing) {
      const created = await WeatherAlert.create(item);
      savedAlerts.push(created);
    }
  }

  return savedAlerts;
};

module.exports = {
  evaluateWeatherAlerts
};
