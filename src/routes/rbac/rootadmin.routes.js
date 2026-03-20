const express = require('express');
const router = express.Router();

const userController = require('../../controllers/rbac/rootadmin.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit');

const validateUser = require('../../middleware/validateUser');


router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

/**
 * =========================================
 * 👤 System Admin Management Routes
 * =========================================
 */

/**
 * Create System Admin
 * Permission: SYS_ADMIN_ADD
 */
router.post(
  '/',
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_ADD'),
  userController.createUser
);

/**
 * List System Admins
 * Permission: SYS_ADMIN_VIEW
 */
router.get(
  '/',
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_VIEW'),
  userController.getUserList
);

// Get Admin by ID
router.get(
  '/:id',
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_VIEW'),
  userController.getAdminById
);

/**
 * Update System Admin
 * Permission: SYS_ADMIN_UPDATE
 */
router.put(
  '/:id',
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_UPDATE'),
  userController.updateUser
);


// Update Role Status
router.patch(
  '/:id/status',
  checkPermission('SYS_ADMINs', 'SYS_ROLE_UPDATE'),
  userController.updateUserStatus
);

/**
 * Delete System Admin (if you implement soft delete later)
 * Permission: SYS_ADMIN_DELETE
 */
// router.delete(
//   '/:id',
//   checkPermission('SYS_ADMINS', 'SYS_ADMIN_DELETE'),
//   userController.deleteUser
// );

/**
 * Reset Admin Password (Admin → Admin)
 * Permission: SYS_ADMIN_RESET_PASSWORD
 */
router.post(
  '/:id/reset-password',
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_RESET_PASSWORD'),
  userController.adminResetUserPassword
);

// Delete Role
router.delete(
  '/:id',
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_DELETE'),
  userController.deleteUser
);


module.exports = router;