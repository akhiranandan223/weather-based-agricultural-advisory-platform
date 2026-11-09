const mongoose = require('mongoose');
const User = require('../models/User');
const Crop = require('../models/Crop');
const CropAdvisories = require('../models/CropAdvisories');
const WeatherAlert = require('../models/WeatherAlert');
const FarmerQuery = require('../models/FarmerQuery');
const WeatherHistory = require('../models/WeatherHistory');
const ActivityLog = require('../models/ActivityLog');
const { seedDatabase } = require('../utils/seedData');
require('./setup');

describe('Database seed data', () => {
  test('validates all seed batches and skips duplicates on subsequent runs', async () => {
    const seedStages = ['Tillering', 'Flowering / Tillering', 'Vegetative'];
    const cropStageEnum = Crop.schema.path('growthStage').enumValues;
    expect(seedStages.every(stage => cropStageEnum.includes(stage))).toBe(true);

    await seedDatabase();
    const initialCounts = await Promise.all([
      User.countDocuments(),
      Crop.countDocuments(),
      CropAdvisories.countDocuments(),
      WeatherAlert.countDocuments(),
      FarmerQuery.countDocuments(),
      WeatherHistory.countDocuments(),
      ActivityLog.countDocuments()
    ]);

    expect(await Crop.distinct('growthStage')).toEqual(expect.arrayContaining(seedStages));

    await seedDatabase();
    const rerunCounts = await Promise.all([
      User.countDocuments(),
      Crop.countDocuments(),
      CropAdvisories.countDocuments(),
      WeatherAlert.countDocuments(),
      FarmerQuery.countDocuments(),
      WeatherHistory.countDocuments(),
      ActivityLog.countDocuments()
    ]);

    expect(rerunCounts).toEqual(initialCounts);
  });

  test('supports shared and crop-specific stages while rejecting mismatches', async () => {
    const userId = new mongoose.Types.ObjectId();
    const commonStages = [
      'Germination',
      'Seedling',
      'Vegetative',
      'Tillering',
      'Flowering',
      'Flowering / Tillering',
      'Fruiting',
      'Grain Filling',
      'Maturity',
      'Harvesting'
    ];

    for (const growthStage of commonStages) {
      await expect(new Crop({
        userId,
        cropName: 'Rice',
        farmArea: 1,
        sowingDate: new Date(),
        growthStage
      }).validate()).resolves.toBeUndefined();
    }

    await expect(new Crop({
      userId,
      cropName: 'Cotton',
      farmArea: 1,
      sowingDate: new Date(),
      growthStage: 'Boll Formation'
    }).validate()).resolves.toBeUndefined();

    await expect(new Crop({
      userId,
      cropName: 'Cotton',
      farmArea: 1,
      sowingDate: new Date(),
      growthStage: 'Silking'
    }).validate()).rejects.toMatchObject({ name: 'ValidationError' });
  });
});
