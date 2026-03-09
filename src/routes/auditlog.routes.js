const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditlog.controller');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * @route   GET /api/audit-logs
 * @desc    Get current activity/audit logs
 * @access  Private (Requires SYS_AUDIT_LOGS - SYS_AUDIT_VIEW)
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('SYS_AUDIT_LOGS', 'SYS_AUDIT_VIEW'),
  auditLogController.listAuditLogs
);

module.exports = router;

