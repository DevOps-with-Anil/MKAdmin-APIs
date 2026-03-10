const router = require('express').Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * =========================================
 * 👥 System Admins Management Routes (ROOT)
 * Module Key: SYS_ADMINS
 * =========================================
 */

/**
 * ➕ Create System Admin
 */
router.post(
  '/',
  authMiddleware, 
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_ADD'),
  userController.createUser
);

/**
 * 📄 List System Admins
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_VIEW'),
  userController.getUserList
);

/**
 * ✏️ Update System Admin
 * (POST kept as-is)
 */
router.post(
  '/:id',
  authMiddleware,
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_UPDATE'),
  userController.updateUser
);

/**
 * Delete System Admin
 */
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_DELETE'),
  userController.deleteUser
);

/**
 * 🔑 Reset System Admin Password
 */
router.post(
  '/:id/reset-password',
  authMiddleware,
  checkPermission('SYS_ADMINS', 'SYS_ADMIN_RESET_PASSWORD'),
  userController.adminResetUserPassword
);

/**
 * 🔑 Self Change Password
 * (No RBAC change)
 */
router.post(
  '/me/change-password',
  authMiddleware,
  userController.changeMyPassword
);

module.exports = router;
