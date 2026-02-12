const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/role.controller');
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * =========================================
 * 🛡️ System Role & Permission Management
 * =========================================
 * Module Key: SYS_ROLES
 */

// Apply authentication middleware to all role routes
router.use(authMiddleware);

/**
 * -----------------------------------------
 * 🎭 Role Management
 * -----------------------------------------
 */

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 */
router.post(
  '/',
  authMiddleware,
  checkPermission('SYS_ROLES', 'SYS_ROLE_ADD'),
  ctrl.createRole
);

/**
 * @route   GET /api/roles
 * @desc    Get list of all roles
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('SYS_ROLES', 'SYS_ROLE_VIEW'),
  ctrl.listRoles
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role details
 */
router.put(
  '/:id',
  authMiddleware,
  checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
  ctrl.updateRole
);

/**
 * @route   PATCH /api/roles/:id/status
 * @desc    Update role active/inactive status
 */
router.patch(
  '/:id/status',
  authMiddleware,
  checkPermission('SYS_ROLES', 'SYS_ROLE_UPDATE'),
  ctrl.updateRoleStatus
);

/**
 * -----------------------------------------
 * 🔐 Role Permissions
 * -----------------------------------------
 */

/**
 * @route   PATCH /api/roles/:id/permissions
 * @desc    Assign module & action permissions to a role
 */
router.patch(
  '/:id/permissions',
  authMiddleware,
  checkPermission('SYS_ROLES', 'SYS_ROLE_ASSIGN_PERMISSIONS'),
  ctrl.assignPermissions
);

module.exports = router;
