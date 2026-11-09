const { connectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');
const mongoose = require('mongoose');

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[Seed Runner] Data seeding routine finished.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Runner Error]', error);
    process.exit(1);
  }
};

run();
