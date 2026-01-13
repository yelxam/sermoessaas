const express = require('express');
const router = express.Router();
const sermonController = require('../controllers/sermonController');
const auth = require('../middlewares/authMiddleware');

// All routes here are protected// CRUD
router.get('/', auth, sermonController.getSermons);
router.post('/generate', auth, sermonController.generateSermon);
router.get('/:id', auth, sermonController.getSermonById);
router.delete('/:id', auth, sermonController.deleteSermon);
router.post('/:id/translate', auth, sermonController.translateSermon);

module.exports = router;
