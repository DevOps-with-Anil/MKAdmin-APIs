const express = require('express');
const router = express.Router();

const rootModuleController = require('../../controllers/rbac/systemmodule.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit'); // ✅ Rate limiter

/**
 * =========================================
 * 🧩 System Modules Management Routes
 * =========================================
 */

router.use(authMiddleware); // ✅ Apply auth globally

/**
 * -----------------------------------------
 * 📦 Module CRUD Operations
 * -----------------------------------------
 */

// Create Module (Strict Security)
router.post(
  '/add',
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_ADD'),
  rootModuleController.createModule
);

// List Modules (Medium Security)
router.get(
  '/',
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_VIEW'),
  rootModuleController.listModules
);

// Get Module
router.get(
  '/:id',
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_VIEW'),
  rootModuleController.getModule
);

// Update Module
router.put(
  '/:id',
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_UPDATE'),
  rootModuleController.updateModule
);

// Delete Module (Strict)
router.delete(
  '/:id',
  userLimiter(),
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
  userLimiter(),
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
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_ADD_ACTION'),
  rootModuleController.addAction
);

router.put(
  '/:id/actions',
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_UPDATE_ACTION'),
  rootModuleController.updateAction
);

router.delete(
  '/:id/actions',
  userLimiter(),
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE_ACTION'),
  rootModuleController.deleteAction
);

module.exports = router;