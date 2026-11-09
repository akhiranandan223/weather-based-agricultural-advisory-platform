const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllFarmers } = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, authorize('admin', 'expert'), getAllFarmers);

module.exports = router;
