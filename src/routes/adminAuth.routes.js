const express = require('express');
const router = express.Router();
const {
  superAdminLogin
} = require('../controllers/adminAuth.controller');

// POST /api/super-admin/login
router.post('/login', superAdminLogin);

module.exports = router;
