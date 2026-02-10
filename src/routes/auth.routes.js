const router = require('express').Router();
const { login } = require('../controllers/auth.controller');

/**
 * =========================================
 * 🔐 Authentication Routes
 * =========================================
 */

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and generate JWT token
 * @access  Public
 */


router.post('/login', login);

module.exports = router;
