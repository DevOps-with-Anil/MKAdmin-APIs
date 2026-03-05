const express = require('express');
const router = express.Router();

const userController = require('../../controllers/platform/user.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit');

router.use(authMiddleware);

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
  userLimiter(),
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_ADD'),
  userController.createUser
);

/**
 * List System Admins
 * Permission: SYS_ADMIN_VIEW
 */
router.get(
  '/',
  userLimiter(),
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_VIEW'),
  userController.getUserList
);

/**
 * Update System Admin
 * Permission: SYS_ADMIN_UPDATE
 */
router.put(
  '/:id',
  userLimiter(),
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_UPDATE'),
  userController.updateUser
);

/**
 * Delete System Admin (if you implement soft delete later)
 * Permission: SYS_ADMIN_DELETE
 */
// router.delete(
//   '/:id',
//   userLimiter(),
//   checkPermission('SYS_ADMINS', 'SYS_ADMIN_DELETE'),
//   userController.deleteUser
// );

/**
 * Reset Admin Password (Admin → Admin)
 * Permission: SYS_ADMIN_RESET_PASSWORD
 */
router.post(
  '/:id/reset-password',
  userLimiter(),
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_RESET_PASSWORD'),
  userController.adminResetUserPassword
);

/**
 * Change My Own Password
 * No module permission required
 * Only authentication required
 */
router.post(
  '/me/change-password',
  userLimiter(),
  userController.changeMyPassword
);

module.exports = router;