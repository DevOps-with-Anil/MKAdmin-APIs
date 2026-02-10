const router = require('express').Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * =========================================
 * 👥 System Users Management Routes (ROOT)
 * Module Key: SYS_USERS
 * =========================================
 * These routes are used by ROOT admins to:
 * - Create and manage system users
 * - Assign roles and permissions
 * - Control access across the platform
 */

/**
 * -----------------------------------------
 * ➕ Create System User
 * -----------------------------------------
 */

/**
 * @route   POST /api/systemusers
 * @desc    Create a new system user
 * @access  Private (Root Admin with SYS_USERS:SYS_USER_ADD permission)
 */
router.post(
  '/',
  authMiddleware, 
  checkPermission('SYS_USERS', 'SYS_USER_ADD'),
  userController.createUser
);

/**
 * -----------------------------------------
 * 📄 List System Users
 * -----------------------------------------
 */

/**
 * @route   GET /api/systemusers
 * @desc    Get paginated list of system users
 * @access  Private (Root Admin with SYS_USERS:SYS_USER_VIEW permission)
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('SYS_USERS', 'SYS_USER_VIEW'),
  userController.getUserList
);

/**
 * -----------------------------------------
 * ✏️ Update System User (Profile Info)
 * -----------------------------------------
 */

/**
 * @route   PUT /api/systemusers/:id
 * @desc    Update system user profile information (no password)
 * @access  Private (Root Admin with SYS_USERS:SYS_USER_UPDATE permission)
 */
router.post(
  '/:id',
  authMiddleware,
  checkPermission('SYS_USERS', 'SYS_USER_UPDATE'),
  userController.updateUser
);

/**
 * -----------------------------------------
 * 🔑 Password Management
 * -----------------------------------------
 */

/**
 * @route   POST /api/systemusers/:id/reset-password
 * @desc    Admin resets a system user's password
 * @access  Private (Root Admin with SYS_USERS:SYS_USER_RESET_PASSWORD permission)
 */
router.post(
  '/:id/reset-password',
  authMiddleware,
  checkPermission('SYS_USERS', 'SYS_USER_RESET_PASSWORD'),
  userController.adminResetUserPassword
);

/**
 * @route   POST /api/systemusers/me/change-password
 * @desc    Logged-in user changes their own password
 * @access  Private (Authenticated User)
 */
router.post(
  '/me/change-password',
  authMiddleware,
  userController.changeMyPassword
);

module.exports = router;
