const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidators');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validateRequest, register);
router.post('/login', authLimiter, loginRules, validateRequest, login);
router.get('/me', protect, me);

module.exports = router;
