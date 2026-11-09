/**
 * Rule-Based Agricultural Advisory Engine
 * Implements transparent agronomic logic mapping real-time/forecast weather
 * to crop-specific field actions across key phenological stages.
 */

const generateCropAdvisories = ({
  cropName,
  growthStage = 'Vegetative',
  temperature = 30,
  humidity = 65,
  rainfall = 0,
  windSpeed = 12,
  rainForecastProb = 15,
  location = {}
}) => {
  const advisories = [];
  const normalizedCrop = (cropName || 'Other').trim();

  // 1. RAINFALL & IRRIGATION RULES
  if (rainfall > 35 || rainForecastProb >= 70) {
    advisories.push({
      advisoryTitle: 'Postpone Irrigation & Ensure Field Drainage',
      weatherCondition: `Rainfall forecasted (${rainfall}mm observed, ${rainForecastProb}% chance)`,
      category: 'Irrigation Management',
      priority: 'High',
      description: `Significant rainfall expected in ${location.district || 'the area'}. Soils in ${normalizedCrop} fields risk waterlogging, which depletes root oxygen.`,
      recommendedAction: 'Immediately postpone scheduled canal/borewell irrigation. Clear drainage furrows and unblock field bund drains to allow excess surface runoff.',
      triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'High probability of rain' }
    });
  } else if (rainfall < 2 && rainForecastProb < 20 && temperature > 34) {
    advisories.push({
      advisoryTitle: 'Schedule Irrigation to Prevent Moisture Stress',
      weatherCondition: `Dry weather with high temperature (${temperature}°C, Humidity: ${humidity}%)`,
      category: 'Irrigation Management',
      priority: 'Medium',
      description: `High evapotranspiration rates are rapidly depleting root-zone moisture during the crucial ${growthStage} stage of ${normalizedCrop}.`,
      recommendedAction: 'Provide light and frequent irrigation during early morning or late evening hours to minimize evaporation losses. Maintain soil mulching if available.',
      triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Hot and dry conditions' }
    });
  }

  // 2. WIND SPEED & SPRAYING RULES
  if (windSpeed >= 22) {
    advisories.push({
      advisoryTitle: 'Avoid Pesticide & Foliar Spraying Due to High Wind Drift',
      weatherCondition: `Strong winds (${windSpeed} km/h, exceeding safe 15 km/h threshold)`,
      category: 'Spraying & Chemical Application',
      priority: 'High',
      description: `Wind speeds exceed standard safety thresholds. Chemical droplets will drift off-target, wasting inputs and risking environmental contamination.`,
      recommendedAction: 'Strictly postpone all foliar nutrient applications and organic/approved spray treatments until early morning when winds subside below 12 km/h. Inspect crop supports/stakes.',
      triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'High wind velocity' }
    });
  }

  // 3. HUMIDITY & FUNGAL DISEASE SUSCEPTIBILITY RULES
  if (humidity >= 78 && temperature >= 22 && temperature <= 32) {
    let fungalTarget = 'foliar fungal pathogens';
    if (normalizedCrop === 'Rice') fungalTarget = 'Blast (Magnaporthe oryzae) and Sheath Blight';
    else if (normalizedCrop === 'Cotton') fungalTarget = 'Bacterial blight and Grey Mildew';
    else if (normalizedCrop === 'Chilli' || normalizedCrop === 'Tomato') fungalTarget = 'Anthracnose fruit rot and Leaf spot';
    else if (normalizedCrop === 'Groundnut') fungalTarget = 'Tikka leaf spot';

    advisories.push({
      advisoryTitle: `Elevated Fungal & Humidity Stress Alert for ${normalizedCrop}`,
      weatherCondition: `High relative humidity (${humidity}%) combined with warm ambient temperature (${temperature}°C)`,
      category: 'Pest & Fungal Risk Prevention',
      priority: 'High',
      description: `Microclimate conditions are exceptionally favorable for spore germination and proliferation of ${fungalTarget} in ${normalizedCrop} during ${growthStage}.`,
      recommendedAction: `Inspect lower foliage closely for circular lesions or leaf discoloration. Avoid overhead sprinkling. Maintain field aeration and consult local Krishi Vigyan Kendra (KVK) for recommended preventive organic sprays.`,
      triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Persistent warm & humid climate' }
    });
  }

  // 4. EXTREME HEAT STRESS RULES
  if (temperature >= 38) {
    advisories.push({
      advisoryTitle: 'Heat Stress Advisory: Protect Crop Canopy',
      weatherCondition: `Extreme maximum temperature (${temperature}°C)`,
      category: 'Temperature Stress Protection',
      priority: 'High',
      description: `Ambient temperature has surpassed the optimal physiological threshold for ${normalizedCrop}, increasing flower drop and pollen desiccation.`,
      recommendedAction: 'Run drip irrigation systems in short pulses to reduce soil surface heat. Avoid nitrogenous fertilizer top-dressing during peak heat hours.',
      triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Heat wave conditions' }
    });
  }

  // 5. CROP-SPECIFIC PHENOLOGICAL STAGE RULES
  if (normalizedCrop === 'Rice') {
    if (growthStage.includes('Flowering') || growthStage.includes('Tillering')) {
      advisories.push({
        advisoryTitle: 'Rice Panicle & Water Level Management',
        weatherCondition: `Stage: ${growthStage} | Temp: ${temperature}°C`,
        category: 'Irrigation Management',
        priority: 'Medium',
        description: 'Rice is in a water-critical phase. Water deficit now can cause high spikelet sterility.',
        recommendedAction: 'Maintain a shallow standing water depth of 2-5 cm in paddy basins. Ensure weed control without disturbing root crowns.',
        triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Critical phenological window' }
      });
    }
  } else if (normalizedCrop === 'Cotton') {
    if (growthStage.includes('Boll') || growthStage.includes('Flowering')) {
      advisories.push({
        advisoryTitle: 'Cotton Boll Retention & Sucking Pest Vigilance',
        weatherCondition: `Temp: ${temperature}°C, Humidity: ${humidity}%`,
        category: 'Field Drainage & Soil Care',
        priority: 'Medium',
        description: 'Fluctuating humidity and cloudy weather promote squaring and boll shedding, as well as sucking pest activity.',
        recommendedAction: 'Install yellow sticky traps (5-6 per acre) to monitor whitefly and jassid populations. Avoid excessive water stagnating near roots.',
        triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Boll formation surveillance' }
      });
    }
  } else if (normalizedCrop === 'Chilli') {
    if (growthStage.includes('Flowering') || growthStage.includes('Vegetative')) {
      advisories.push({
        advisoryTitle: 'Chilli Flower Drop & Thrips Monitoring',
        weatherCondition: `Temp: ${temperature}°C, Humidity: ${humidity}%`,
        category: 'Pest & Fungal Risk Prevention',
        priority: 'Medium',
        description: 'Dry winds combined with rising temperatures lead to upward leaf curling and flower abortion in chilli.',
        recommendedAction: 'Apply light sprinkler irrigation or spray 1% potassium nitrate (KNO3) during cool hours to enhance flower retention after consulting agricultural extension staff.',
        triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Chilli bloom protection' }
      });
    }
  } else if (normalizedCrop === 'Maize') {
    if (growthStage.includes('Silking') || growthStage.includes('Tasseling')) {
      advisories.push({
        advisoryTitle: 'Maize Moisture Protection During Silking',
        weatherCondition: `Temp: ${temperature}°C, Wind: ${windSpeed} km/h`,
        category: 'Irrigation Management',
        priority: 'High',
        description: 'Tasseling and silking are the most moisture-sensitive growth periods for maize. Any stress will reduce grain cob filling.',
        recommendedAction: 'Ensure soil moisture is maintained at field capacity. Avoid nutrient deficiency during cob development.',
        triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Maize critical stage' }
      });
    }
  }

  // Fallback general advisory if conditions are optimal
  if (advisories.length === 0) {
    advisories.push({
      advisoryTitle: `Favorable Weather for Standard Agronomic Practices in ${normalizedCrop}`,
      weatherCondition: `Optimal range (Temp: ${temperature}°C, Humidity: ${humidity}%, Wind: ${windSpeed} km/h)`,
      category: 'General Care',
      priority: 'Low',
      description: `Current atmospheric parameters are well suited for standard cultivation, intercultural operations, and balanced nutrition in ${growthStage} stage.`,
      recommendedAction: 'Carry out regular weeding, inter-cultivation, and scheduled organic or fertilizer application as per package of practices.',
      triggeringWeather: { temperature, humidity, rainfall, windSpeed, forecastSummary: 'Mild, stable agricultural weather' }
    });
  }

  return advisories;
};

module.exports = {
  generateCropAdvisories
};
