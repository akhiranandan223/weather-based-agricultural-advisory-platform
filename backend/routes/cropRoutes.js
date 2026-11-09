const express = require('express');
const router = express.Router();
const {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');
const { validateCrop } = require('../middleware/validate');

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(authorize('farmer', 'admin'), validateCrop, createCrop);

router.route('/:id')
  .get(getCropById)
  .put(authorize('farmer', 'admin'), updateCrop)
  .delete(authorize('farmer', 'admin'), deleteCrop);

module.exports = router;
