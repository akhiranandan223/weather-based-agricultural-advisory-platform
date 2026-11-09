const express = require('express');
const router = express.Router();
const {
  getExpertQueries,
  submitExpertResponse,
  getExpertStats
} = require('../controllers/expertController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('expert', 'admin'));

router.get('/queries', getExpertQueries);
router.post('/responses', submitExpertResponse);
router.get('/stats', getExpertStats);

module.exports = router;
