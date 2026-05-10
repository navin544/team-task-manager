const express = require('express');

const { getDashboardSummaryController } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getDashboardSummaryController);

module.exports = router;
