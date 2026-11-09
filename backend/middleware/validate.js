const { isValidGrowthStageForCrop } = require('../utils/cropGrowthStages');

const validateRegistration = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (role && !['admin', 'farmer', 'expert'].includes(role)) {
    errors.push('Role must be either farmer, expert, or admin.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateCrop = (req, res, next) => {
  const { cropName, farmArea, sowingDate, growthStage } = req.body;
  const errors = [];

  if (!cropName || cropName.trim() === '') {
    errors.push('Crop name is required.');
  }

  if (farmArea === undefined || farmArea === null || Number(farmArea) <= 0) {
    errors.push('Farm area must be a positive number.');
  }

  if (!sowingDate) {
    errors.push('Sowing date is required.');
  }

  if (!growthStage) {
    errors.push('Growth stage is required.');
  } else if (!isValidGrowthStageForCrop(growthStage, cropName)) {
    errors.push(`Growth stage '${growthStage}' is not valid for ${cropName || 'this crop'}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Crop validation failed',
      errors
    });
  }

  next();
};

const validateQuery = (req, res, next) => {
  const { cropName, title, problemDescription } = req.body;
  const errors = [];

  if (!cropName || cropName.trim() === '') {
    errors.push('Crop name is required.');
  }

  if (!title || title.trim().length < 3) {
    errors.push('Query title must be at least 3 characters.');
  }

  if (!problemDescription || problemDescription.trim().length < 10) {
    errors.push('Problem description must be at least 10 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Query validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateCrop,
  validateQuery
};
