const express = require('express');
const router = express.Router();
const bibleStudyController = require('../controllers/bibleStudyController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST api/bible-study
// @desc    Conduct an AI-powered bible study
// @access  Private
router.post('/', authMiddleware, bibleStudyController.conductStudy);

module.exports = router;
