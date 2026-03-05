const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const { getMyProfile } = require('../../controllers/platform/adminProfile.controller');
const { userLimiter } = require('../../config/rateLimit'); // dynamic Redis-based limiter

/**
 * =========================================
 * 👤 Admin Profile Routes
 * =========================================
 */

/**
 * @route   GET /api/super-admin/me
 * @desc    Get logged-in super admin profile details
 * @access  Private (Super Admin)
 * @rate-limit User-based (dynamic, from env)
 */
router.get('/me', auth, userLimiter(), getMyProfile);

module.exports = router;