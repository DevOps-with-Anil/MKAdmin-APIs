const router = require('express').Router();
const { rootlogin } = require('../../controllers/auth/auth.controller');
const { loginLimiter } = require('../../config/rateLimit');

/**
 * 🔐 Login route with dynamic rate limiter
 */
router.post('/root', loginLimiter(), rootlogin);

module.exports = router;