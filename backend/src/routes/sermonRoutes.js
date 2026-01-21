const express = require('express');
const router = express.Router();
const sermonController = require('../controllers/sermonController');
const auth = require('../middlewares/authMiddleware');

// All routes here are protected// CRUD
router.get('/', auth, sermonController.getSermons);
router.post('/', auth, sermonController.createSermon);
router.post('/generate', auth, sermonController.generateSermon);
router.get('/:id', auth, sermonController.getSermonById);
router.put('/:id', auth, sermonController.updateSermon);
router.delete('/:id', auth, sermonController.deleteSermon);
router.post('/:id/translate', auth, sermonController.translateSermon);
router.post('/study', auth, require('../controllers/bibleStudyController').conductStudy);

module.exports = router;
