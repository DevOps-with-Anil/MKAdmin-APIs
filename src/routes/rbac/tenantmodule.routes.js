const express = require('express');
const router = express.Router();

const rootModuleController = require('../../controllers/rbac/tenantmodule.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit'); // ✅ Rate limiter

const validateUser = require('../../middleware/validateUser');


router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

/**
 * -----------------------------------------
 * 📦 Module CRUD Operations
 * -----------------------------------------
 */

// Create Module (Strict Security)
router.post(
  '/add',
  checkPermission('SYS_MODULES', 'SYS_MODULE_ADD'),
  rootModuleController.createModule
);

// List Modules (Medium Security)
router.get(
  '/',
  checkPermission('SYS_MODULES', 'SYS_MODULE_VIEW'),
  rootModuleController.listModules
);

// Get Module
router.get(
  '/:id',
  checkPermission('SYS_MODULES', 'SYS_MODULE_VIEW'),
  rootModuleController.getModule
);

// Update Module
router.put(
  '/:id',
  checkPermission('SYS_MODULES', 'SYS_MODULE_UPDATE'),
  rootModuleController.updateModule
);

// Delete Module (Strict)
router.delete(
  '/:id',
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE'),
  rootModuleController.deleteModule
);

/**
 * -----------------------------------------
 * 🔁 Module Status
 * -----------------------------------------
 */

router.patch(
  '/:id/status',
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE'),
  rootModuleController.toggleModuleStatus
);

/**
 * -----------------------------------------
 * ⚙️ Module Actions
 * -----------------------------------------
 */

router.post(
  '/:id/actions',
  checkPermission('SYS_MODULES', 'SYS_MODULE_ADD_ACTION'),
  rootModuleController.addAction
);

router.put(
  '/:id/actions',
  checkPermission('SYS_MODULES', 'SYS_MODULE_UPDATE_ACTION'),
  rootModuleController.updateAction
);

router.delete(
  '/:id/actions',
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE_ACTION'),
  rootModuleController.deleteAction
);

module.exports = router;