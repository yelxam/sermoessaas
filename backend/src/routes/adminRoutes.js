const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');
const superAdmin = require('../middlewares/superAdminMiddleware');

// Apply middleware to all routes
router.use(auth);
router.use(superAdmin);

router.post('/users', adminController.createSuperUser);
router.get('/companies', adminController.getAllCompanies);

module.exports = router;
