const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Crop = require('../models/Crop');
const WeatherHistory = require('../models/WeatherHistory');
const CropAdvisories = require('../models/CropAdvisories');
const WeatherAlert = require('../models/WeatherAlert');
const FarmerQuery = require('../models/FarmerQuery');
const ActivityLog = require('../models/ActivityLog');

const createValidated = async (Model, records) => {
  const isBatch = Array.isArray(records);
  const documents = (isBatch ? records : [records]).map(record => new Model(record));

  await Promise.all(documents.map(document => document.validate()));
  const savedDocuments = await Promise.all(documents.map(document => document.save()));

  return isBatch ? savedDocuments : savedDocuments[0];
};

const seedDatabase = async () => {
  console.log('[Seed Engine] Checking existing records...');
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log(`[Seed Engine] Database already populated (${userCount} users found). Skipping initial seeding to prevent duplicates.`);
    return;
  }

  console.log('[Seed Engine] Populating initial demo and academic test data...');

  // 1. Create Default Users
  const [admin, expert, farmer, farmer2] = await createValidated(User, [
    {
      name: 'Dr. A. Ramakrishna (System Administrator)',
      email: 'admin@agroadvisory.in',
      password: 'Password@123',
      role: 'admin',
      phone: '+91 98765 43210',
      state: 'Telangana',
      district: 'Warangal',
      village: 'SR University Campus'
    },
    {
      name: 'Dr. K. Srinivasa Rao (Agri Scientist)',
      email: 'expert@agroadvisory.in',
      password: 'Password@123',
      role: 'expert',
      phone: '+91 98480 12345',
      state: 'Telangana',
      district: 'Warangal',
      village: 'Agricultural Research Station'
    },
    {
      name: 'Ramesh Patel (Lead Farmer)',
      email: 'farmer@agroadvisory.in',
      password: 'Password@123',
      role: 'farmer',
      phone: '+91 94401 56789',
      state: 'Telangana',
      district: 'Warangal',
      village: 'Ananthasagar'
    },
    {
      name: 'Lakshmi Narayana',
      email: 'farmer2@agroadvisory.in',
      password: 'Password@123',
      role: 'farmer',
      phone: '+91 99887 66554',
      state: 'Telangana',
      district: 'Karimnagar',
      village: 'Choppadandi'
    }
  ]);

  // 2. Farmer Profiles
  await createValidated(FarmerProfile, [
    {
      userId: farmer._id,
      farmSize: 6.5,
      landUnit: 'acres',
      soilType: 'Red Sandy Loam',
      irrigationMethod: 'Drip Irrigation',
      experienceYears: 12,
      primaryCrops: ['Rice', 'Cotton', 'Chilli'],
      farmingLocation: {
        state: 'Telangana',
        district: 'Warangal',
        village: 'Ananthasagar',
        pincode: '506371',
        latitude: 17.9689,
        longitude: 79.5941
      },
      notes: 'Primary focus on semi-arid water management and IPM for cotton and chilli.'
    },
    {
      userId: farmer2._id,
      farmSize: 4.0,
      landUnit: 'acres',
      soilType: 'Black Cotton',
      irrigationMethod: 'Canal / Furrow',
      experienceYears: 8,
      primaryCrops: ['Maize', 'Soybean'],
      farmingLocation: {
        state: 'Telangana',
        district: 'Karimnagar',
        village: 'Choppadandi',
        pincode: '505415',
        latitude: 18.4386,
        longitude: 79.1288
      }
    }
  ]);

  // 3. Register Crops
  const [crop1, crop2, crop3, crop4] = await createValidated(Crop, [
    {
      userId: farmer._id,
      cropName: 'Rice',
      cropCategory: 'Cereals',
      variety: 'BPT 5204 (Samba Mahsuri)',
      farmArea: 3.5,
      areaUnit: 'acres',
      sowingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      expectedHarvestDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      growthStage: 'Tillering',
      soilType: 'Red Sandy Loam',
      irrigationMethod: 'Borewell / Tube Well',
      location: { state: 'Telangana', district: 'Warangal', village: 'Ananthasagar' },
      notes: 'Transplanted during late monsoon; monitored for blast risk.'
    },
    {
      userId: farmer._id,
      cropName: 'Cotton',
      cropCategory: 'Fiber Crop',
      variety: 'Bt Cotton Hybrid',
      farmArea: 2.0,
      areaUnit: 'acres',
      sowingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expectedHarvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      growthStage: 'Flowering / Tillering',
      soilType: 'Black Cotton',
      irrigationMethod: 'Drip Irrigation',
      location: { state: 'Telangana', district: 'Warangal', village: 'Ananthasagar' },
      notes: 'Intercropped with pulses along perimeter bunds.'
    },
    {
      userId: farmer._id,
      cropName: 'Chilli',
      cropCategory: 'Spices',
      variety: 'Teja Long Red',
      farmArea: 1.0,
      areaUnit: 'acres',
      sowingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      growthStage: 'Vegetative',
      soilType: 'Red Sandy Loam',
      irrigationMethod: 'Drip Irrigation',
      location: { state: 'Telangana', district: 'Warangal', village: 'Ananthasagar' }
    },
    {
      userId: farmer2._id,
      cropName: 'Maize',
      cropCategory: 'Cereals',
      variety: 'DHM-117 Single Cross Hybrid',
      farmArea: 4.0,
      areaUnit: 'acres',
      sowingDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      growthStage: 'Vegetative',
      soilType: 'Clay Loam',
      irrigationMethod: 'Sprinkler',
      location: { state: 'Telangana', district: 'Karimnagar', village: 'Choppadandi' }
    }
  ]);

  // 4. Crop Advisories
  await createValidated(CropAdvisories, [
    {
      userId: farmer._id,
      cropId: crop1._id,
      cropName: 'Rice',
      growthStage: 'Tillering',
      advisoryTitle: 'Rice Panicle & Water Level Management',
      weatherCondition: 'Moderate Humidity (68%), Temp: 31°C',
      description: 'Rice is in an active tillering stage. Water depth must be maintained to discourage weed emergence.',
      recommendedAction: 'Maintain 2 to 3 cm water level in the field. Avoid sudden dry spells during tillering.',
      priority: 'Medium',
      category: 'Irrigation Management',
      triggeringWeather: { temperature: 31, humidity: 68, rainfall: 0, windSpeed: 11, forecastSummary: 'Optimal tillering' }
    },
    {
      userId: farmer._id,
      cropId: crop2._id,
      cropName: 'Cotton',
      growthStage: 'Flowering / Tillering',
      advisoryTitle: 'Avoid Foliar Pesticide Application During High Winds',
      weatherCondition: 'Gusty Winds (26 km/h forecasted)',
      description: 'Wind speeds exceed the safe spraying threshold of 15 km/h, causing spray drift away from cotton blooms.',
      recommendedAction: 'Postpone chemical/organic foliar spraying until early morning when wind speed drops below 12 km/h.',
      priority: 'High',
      category: 'Spraying & Chemical Application',
      triggeringWeather: { temperature: 33, humidity: 55, rainfall: 0, windSpeed: 26, forecastSummary: 'High wind velocity' }
    },
    {
      userId: farmer._id,
      cropId: crop3._id,
      cropName: 'Chilli',
      growthStage: 'Vegetative',
      advisoryTitle: 'Precautionary Fungal Scrutiny for Chilli',
      weatherCondition: 'Relative Humidity 78%, Temp 27°C',
      description: 'Warm humid micro-climate elevates susceptibility to fungal damping-off and cercospora leaf spots.',
      recommendedAction: 'Inspect bottom foliage for yellow ring spots. Ensure proper soil aeration along irrigation furrows.',
      priority: 'High',
      category: 'Pest & Fungal Risk Prevention',
      triggeringWeather: { temperature: 27, humidity: 78, rainfall: 4, windSpeed: 10, forecastSummary: 'Warm and humid conditions' }
    }
  ]);

  // 5. Weather Alerts
  await createValidated(WeatherAlert, [
    {
      alertTitle: 'Heavy Rainfall Advisory (65mm expected) for Warangal District',
      alertType: 'Heavy Rainfall',
      severity: 'High',
      description: 'A depression over the Bay of Bengal will trigger heavy localized rainfall across Northern Telangana over the next 48 hours.',
      recommendedPrecaution: 'Open drainage gates around paddy and cotton fields. Postpone pesticide spraying and nitrogen fertilizer top dressing.',
      location: { city: 'Warangal', state: 'Telangana', district: 'Warangal', village: 'All' },
      isOfficial: true,
      thresholdTriggered: { metric: 'rainfall', value: 65, threshold: 40 }
    },
    {
      alertTitle: 'Strong Afternoon Wind Advisory (32 km/h)',
      alertType: 'Strong Winds',
      severity: 'Medium',
      description: 'Daytime surface winds exceeding 30 km/h recorded across Karimnagar and Warangal agro-climatic zones.',
      recommendedPrecaution: 'Provide physical earthing up and support stakes for vegetable vines and maize.',
      location: { city: 'Warangal', state: 'Telangana', district: 'Warangal', village: 'All' },
      isOfficial: false,
      thresholdTriggered: { metric: 'windSpeed', value: 32, threshold: 30 }
    }
  ]);

  // 6. Farmer Queries & Expert Responses
  await createValidated(FarmerQuery, [
    {
      farmerId: farmer._id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      cropId: crop2._id,
      cropName: 'Cotton',
      growthStage: 'Flowering / Tillering',
      title: 'Premature flower bud shedding after light shower',
      problemDescription: 'My cotton crop is showing yellowing of small squares and some flower buds are dropping off after the overcast weather yesterday. Soil is red sandy loam with drip irrigation.',
      urgency: 'High',
      farmingLocation: { state: 'Telangana', district: 'Warangal', village: 'Ananthasagar' },
      weatherContext: { temperature: 31.5, humidity: 74, condition: 'Clouds', recordedAt: new Date() },
      status: 'Answered',
      responses: [
        {
          expertId: expert._id,
          expertName: expert.name,
          expertQualification: 'Senior Agronomist, Agricultural Research Station',
          message: 'The square dropping is primarily induced by sudden cloudiness-induced hormonal imbalance combined with micro-nutrient stress. Since high winds are subsiding, prepare a light foliar spray.',
          recommendedAction: 'Spray Planofix (Alpha NAA) @ 4 ml per 15 liters of water during early morning hours. Supplement with 1% 19-19-19 water soluble fertilizer.',
          weatherConsiderations: 'Perform spraying only if wind speed remains under 14 km/h and rain probability is below 20%.',
          createdAt: new Date()
        }
      ]
    },
    {
      farmerId: farmer._id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      cropId: crop1._id,
      cropName: 'Rice',
      growthStage: 'Tillering',
      title: 'Brown spots appearing on leaf margins of BPT 5204',
      problemDescription: 'Noticed small elliptical spindle-shaped spots on younger leaves. Leaves are turning slightly reddish brown towards the edges. Weather has been damp in the mornings.',
      urgency: 'Medium',
      farmingLocation: { state: 'Telangana', district: 'Warangal', village: 'Ananthasagar' },
      weatherContext: { temperature: 28, humidity: 82, condition: 'Clouds', recordedAt: new Date() },
      status: 'Pending'
    }
  ]);

  // 7. Weather History Records for Analytics
  const sampleCities = ['Warangal', 'Karimnagar', 'Nizamabad', 'Hyderabad'];
  const weatherHistoryRecords = [];
  for (let d = 10; d >= 0; d--) {
    const recDate = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    for (const city of sampleCities) {
      weatherHistoryRecords.push({
        location: {
          city,
          state: 'Telangana',
          country: 'IN',
          latitude: 17.9689,
          longitude: 79.5941
        },
        recordedAt: recDate,
        temperature: 28 + Math.round(Math.sin(d) * 5 * 10) / 10,
        feelsLike: 29 + Math.round(Math.sin(d) * 4 * 10) / 10,
        tempMin: 22,
        tempMax: 34,
        humidity: 60 + Math.round(Math.cos(d) * 18),
        pressure: 1012,
        windSpeed: 10 + (d % 6),
        windDirection: 135,
        rainfall: d === 3 ? 18.5 : d === 7 ? 42.0 : 0.0,
        cloudCover: d === 7 ? 80 : 25,
        visibility: 9500,
        condition: d === 7 ? 'Rain' : d === 3 ? 'Clouds' : 'Clear',
        description: d === 7 ? 'Moderate rain showers' : 'Clear skies',
        dataSource: 'LIVE_API'
      });
    }
  }
  await createValidated(WeatherHistory, weatherHistoryRecords);

  // 8. Initial Activity Log
  await createValidated(ActivityLog, {
    userId: admin._id,
    userName: admin.name,
    userRole: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    module: 'SYSTEM',
    details: 'Initial system seed data loaded: Admin, Expert, Farmers, Crops, Advisories, Alerts, and Historical Weather Data.'
  });

  console.log('[Seed Engine] Seeding completed successfully!');
  console.log('--- DEFAULT CREDENTIALS ---');
  console.log('Admin:  admin@agroadvisory.in  / Password@123');
  console.log('Farmer: farmer@agroadvisory.in / Password@123');
  console.log('Expert: expert@agroadvisory.in / Password@123');
  console.log('---------------------------');
};

module.exports = {
  seedDatabase
};
