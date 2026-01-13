const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middlewares/authMiddleware');

// Platform / General
router.get('/', auth, companyController.getAllCompanies);
router.post('/', auth, companyController.createCompany);

// My Company context
router.get('/me', auth, companyController.getMyCompany);
router.put('/me', auth, companyController.updateMyCompany);

// Churches (My Company)
router.get('/churches', auth, companyController.getChurches);
router.post('/churches', auth, companyController.createChurch);
router.delete('/churches/:id', auth, companyController.deleteChurch);

module.exports = router;
