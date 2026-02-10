const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/role.controller');

/**
 * =========================================
 * 🛡️ Role & Permission Management Routes
 * =========================================
 */

// Apply authentication middleware to all role routes
router.use(auth);

/**
 * -----------------------------------------
 * 🎭 Role Management
 * -----------------------------------------
 */

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 * @access  Private (Root/Admin with Role Create Permission)
 */
router.post('/', ctrl.createRole);

/**
 * @route   GET /api/roles
 * @desc    Get list of all roles
 * @access  Private (Root/Admin with Role View Permission)
 */
router.get('/', ctrl.listRoles);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role details
 * @access  Private (Root/Admin with Role Update Permission)
 */
router.put('/:id', ctrl.updateRole);

/**
 * @route   PATCH /api/roles/:id/status
 * @desc    Update role active/inactive status
 * @access  Private (Root/Admin with Role Status Update Permission)
 */
router.patch('/:id/status', ctrl.updateRoleStatus);

/**
 * -----------------------------------------
 * 🔐 Role Permissions
 * -----------------------------------------
 */

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    Assign module & action permissions to a role
 * @access  Private (Root/Admin with Permission Assign Rights)
 */
router.post('/:id/permissions', ctrl.assignPermissions);

module.exports = router;
