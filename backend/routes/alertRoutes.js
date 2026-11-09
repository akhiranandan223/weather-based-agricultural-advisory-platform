const express = require('express');
const router = express.Router();
const {
  getAlerts,
  markAlertRead,
  createAlert,
  deactivateAlert
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', (req, res, next) => {
  // Optional auth
  if (req.headers.authorization) {
    return protect(req, res, () => getAlerts(req, res, next));
  }
  getAlerts(req, res, next);
});

router.put('/:id/read', protect, markAlertRead);
router.post('/', protect, authorize('admin'), createAlert);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateAlert);

module.exports = router;
