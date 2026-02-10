const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getMyProfile } = require('../controllers/adminProfile.controller');

/**
 * =========================================
 * 👤 Admin Profile Routes
 * =========================================
 */

/**
 * @route   GET /api/super-admin/me
 * @desc    Get logged-in super admin profile details
 * @access  Private (Super Admin)
 */
router.get('/me', auth, getMyProfile);

module.exports = router;
