const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// @route   GET /admin/metrics
// @desc    Get system wide metrics (Super Admin only)
// @access  Private (Admin)
router.get('/metrics', auth, adminController.getMetrics);

module.exports = router;
