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

// // Create Role
// router.post(
//   '/',
//   checkPermission('SYS_ROLES', 'SYS_ROLE_ADD'),
//   ctrl.createRole
// );

// // List Roles
// router.get(
//   '/',
//   checkPermission('SYS_ROLES', 'SYS_ROL_VIEW'),
//   ctrl.listRoles
// );

// // Get Role by ID
// router.get(
//   '/:id',
//   checkPermission('SYS_ROLES', 'SYS_ROLE_VIEW'),
//   ctrl.getRoleById
// );

// // Update Role
// router.put(
//   '/:id',
//   checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
//   ctrl.updateRole
// );

// // Update Role Status
// router.patch(
//   '/:id/status',
//   checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
//   ctrl.updateRoleStatus
// );

// // Delete Role
// router.delete(
//   '/:id',
//   checkPermission('SYS_ROLES', 'SYS_ROLE_DELETE'),
//   ctrl.deleteRole
// );

// // Assign Permissions
// router.post(
//   '/:id/permissions',
//   checkPermission('SYS_ROLES', 'SYS_ROLE_ASSIGN_PERMISSIONS'),
//   ctrl.assignModulesPermissions
// );


// Create Role
router.post(
  '/',
  checkPermission('SYS_ROLES', 'SYS_ROLE_ADD'),
  ctrl.createRole
);

// List Roles
router.get(
  '/',
  checkPermission('SYS_ROLES', 'SYS_ROLE_VIEW'),
  ctrl.listRoles
);

// Get Role by ID
router.get(
  '/:id',
  checkPermission('SYS_ROLES', 'SYS_ROLE_VIEW'),
  ctrl.getRoleById
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

// Assign Permissions
router.post(
  '/:id/permissions',
  checkPermission('SYS_ROLES', 'SYS_ROLE_ASSIGN_PERMISSIONS'),
  ctrl.assignModulesPermissions
);

module.exports = router;