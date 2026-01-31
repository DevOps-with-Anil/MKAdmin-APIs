const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getMyProfile } = require('../controllers/adminProfile.controller');

// GET /api/super-admin/me
router.get('/me', auth, getMyProfile);

module.exports = router;
