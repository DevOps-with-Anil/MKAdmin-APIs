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
 * Create User
 */
router.post(
  '/',
  checkPermission('SYS_USERS', 'SYS_USER_ADD'),
  userController.createUser
);

/**
 * List Users
 */
router.get(
  '/',
  checkPermission('SYS_USERS', 'SYS_USER_VIEW'),
  userController.getUserList
);

/**
 * Get User by ID
 */
router.get(
  '/:id',
  checkPermission('SYS_USERS', 'SYS_USER_VIEW'),
  userController.getAdminById
);

/**
 * Update User
 */
router.put(
  '/:id',
  checkPermission('SYS_USERS', 'SYS_USER_UPDATE'),
  userController.updateUser
);

/**
 * Update User Status
 */
router.patch(
  '/:id/status',
  checkPermission('SYS_USERS', 'SYS_USER_CHANGE_STATUS'),
  userController.updateUserStatus
);

/**
 * Reset User Password
 */
router.post(
  '/:id/reset-password',
  checkPermission('SYS_USERS', 'SYS_USER_RESET_PASSWORD'),
  userController.adminResetUserPassword
);

/**
 * Delete User
 */
router.delete(
  '/:id',
  checkPermission('SYS_USERS', 'SYS_USER_DELETE'),
  userController.deleteUser
);


module.exports = router;