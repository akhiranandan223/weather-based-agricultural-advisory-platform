const express = require('express');
const router = express.Router();
const {
  submitQuery,
  getQueries,
  getQueryById,
  updateQueryStatus
} = require('../controllers/queryController');
const { protect } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validate');

router.use(protect);

router.route('/')
  .get(getQueries)
  .post(validateQuery, submitQuery);

router.route('/:id')
  .get(getQueryById)
  .put(updateQueryStatus);

module.exports = router;
