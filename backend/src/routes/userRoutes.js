const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, userController.getCompanyUsers);
router.post('/', auth, userController.createUser);

module.exports = router;
