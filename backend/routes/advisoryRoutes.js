const express = require('express');
const router = express.Router();
const {
  getAdvisories,
  generateAdvisory,
  getAdvisoryHistory,
  updateAdvisoryStatus
} = require('../controllers/advisoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAdvisories);
router.post('/generate', generateAdvisory);
router.get('/history', getAdvisoryHistory);
router.put('/:id/status', updateAdvisoryStatus);

module.exports = router;
