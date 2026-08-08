const express = require('express');
const { createIntent, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// NOTE: the webhook route is mounted separately in app.js with express.raw()
// BEFORE express.json(), because Stripe's signature check needs the raw body.
router.post('/create-intent', protect, createIntent);

module.exports = router;
module.exports.webhook = webhook;
