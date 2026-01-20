const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middlewares/authMiddleware');

// Platform / General
router.get('/', auth, companyController.getAllCompanies);
router.get('/stats', auth, companyController.getAdminStats);
router.post('/', auth, companyController.createCompany);
router.put('/:id', auth, companyController.updateCompany);

// Plan Approval Workflow
router.get('/requests/pending', auth, companyController.listPendingRequests);
router.post('/requests/:id/approve', auth, companyController.approvePlanRequest);
router.post('/requests/:id/reject', auth, companyController.rejectPlanRequest);

// My Company context
router.get('/me', auth, companyController.getMyCompany);
router.put('/me', auth, companyController.updateMyCompany);
router.put('/me/plan', auth, companyController.updateMyPlan);

// Churches (My Company)
router.get('/churches', auth, companyController.getChurches);
router.post('/churches', auth, companyController.createChurch);
router.delete('/churches/:id', auth, companyController.deleteChurch);

module.exports = router;
