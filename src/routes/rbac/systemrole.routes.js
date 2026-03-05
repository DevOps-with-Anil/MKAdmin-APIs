const router = require('express').Router();
const authMiddleware = require('../../middleware/auth');
const ctrl = require('../../controllers/rbac/systemrole.controller');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit'); // ✅ Rate limiter

/**
 * =========================================
 * 🛡️ System Role & Permission Management
 * =========================================
 * Module Key: SYS_ROLES
 */

// Apply auth globally (Good practice)
router.use(authMiddleware);

/**
 * -----------------------------------------
 * 🎭 Role Management
 * -----------------------------------------
 */

// Create Role
router.post(
  '/',
  userLimiter(), // ✅ Rate Limit
  checkPermission('SYS_ROLES', 'SYS_ROLE_ADD'),
  ctrl.createRole
);

// List Roles
router.get(
  '/',
  userLimiter(), // ✅ Rate Limit
  checkPermission('SYS_ROLES', 'SYS_ROLE_VIEW'),
  ctrl.listRoles
);

// Update Role
router.put(
  '/:id',
  userLimiter(), // ✅ Rate Limit
  checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
  ctrl.updateRole
);

// Update Role Status
router.patch(
  '/:id/status',
  userLimiter(), // ✅ Rate Limit
  checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
  ctrl.updateRoleStatus
);

/**
 * -----------------------------------------
 * 🔐 Role Permissions
 * -----------------------------------------
 */

// Assign Permissions
router.patch(
  '/:id/permissions',
  userLimiter(), // ✅ Rate Limit
  checkPermission('SYS_ROLES', 'SYS_ROLE_ASSIGN_PERMISSIONS'),
  ctrl.assignPermissions
);

module.exports = router;