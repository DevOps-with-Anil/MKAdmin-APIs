const router = require('express').Router();
const authMiddleware = require('../../middleware/auth');
const ctrl = require('../../controllers/rbac/systemrole.controller');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit'); // ✅ Rate limiter
const validateUser = require('../../middleware/validateUser');


router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

/**
 * -----------------------------------------
 * 🎭 Role Management
 * -----------------------------------------
 */

// Create Role
router.post(
  '/',
  checkPermission('SYS_ROLES', 'SYS_ROLE_ADD'),
  ctrl.createRole
);

// List Roles
router.get(
  '/',
  checkPermission('SYS_ROLES', 'SYS_ROLE_ADD'),
  ctrl.listRoles
);

// Update Role
router.put(
  '/:id',
  checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
  ctrl.updateRole
);

// Update Role Status
router.patch(
  '/:id/status',
  checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
  ctrl.updateRoleStatus
);

// Delete Role
router.delete(
  '/:id',
  checkPermission('SYS_ROLES', 'SYS_ROLE_DELETE'),
  ctrl.deleteRole
);

/**
 * -----------------------------------------
 * 🔐 Role Permissions
 * -----------------------------------------
 */

// Assign Permissions
router.patch(
  '/:id/permissions',
  checkPermission('SYS_ROLES', 'SYS_ROLE_ASSIGN_PERMISSIONS'),
  ctrl.assignPermissions
);

module.exports = router;