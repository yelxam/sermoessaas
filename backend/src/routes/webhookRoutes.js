const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Kiwify Webhook endpoint
router.post('/kiwify', webhookController.handleKiwifyWebhook);

module.exports = router;
