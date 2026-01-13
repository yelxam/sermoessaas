const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, planController.getAllPlans);
router.post('/', auth, planController.createPlan);
router.put('/:id', auth, planController.updatePlan);
router.delete('/:id', auth, planController.deletePlan);

module.exports = router;
