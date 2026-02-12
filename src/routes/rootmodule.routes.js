// const express = require('express');
// const router = express.Router();
// const rootModuleController = require('../controllers/rootmodule.controller');

// // Authentication middleware
// const authMiddleware = require('../middleware/auth');

// // Permission check middleware
// const { checkPermission } = require('../middleware/permissionMiddleware');

// /**
//  * =========================================
//  * 🧩 Root System Modules Management Routes
//  * =========================================
//  * These routes are used by ROOT admins to:
//  * - Manage system-wide modules
//  * - Define available features
//  * - Configure allowed actions per module
//  * - Control availability for tenants/affiliates
//  */

// /**
//  * -----------------------------------------
//  * 📦 Module CRUD Operations
//  * -----------------------------------------
//  */

// /**
//  * @route   POST /api/root-modules/add
//  * @desc    Create a new root system module
//  * @access  Private (Root Admin with ROOT_MODULES:ADD permission)
//  */
// router.post(
//   '/add',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'ADD'),
//   rootModuleController.createModule
// );

// /**
//  * @route   GET /api/root-modules
//  * @desc    Get list of all root system modules
//  * @access  Private (Root Admin with ROOT_MODULES:VIEW permission)
//  */
// router.get(
//   '/',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'VIEW'),
//   rootModuleController.listModules
// );

// /**
//  * @route   GET /api/root-modules/:id
//  * @desc    Get details of a specific root module
//  * @access  Private (Root Admin with ROOT_MODULES:VIEW permission)
//  */
// router.get(
//   '/:id',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'VIEW'),
//   rootModuleController.getModule
// );

// /**
//  * @route   PUT /api/root-modules/:id
//  * @desc    Update a root system module
//  * @access  Private (Root Admin with ROOT_MODULES:EDIT permission)
//  */
// router.put(
//   '/:id',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'EDIT'),
//   rootModuleController.updateModule
// );

// /**
//  * @route   DELETE /api/root-modules/:id
//  * @desc    Delete a root system module
//  * @access  Private (Root Admin with ROOT_MODULES:DELETE permission)
//  */
// router.delete(
//   '/:id',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'DELETE'),
//   rootModuleController.deleteModule
// );

// /**
//  * -----------------------------------------
//  * 🔁 Module Status Management
//  * -----------------------------------------
//  */

// /**
//  * @route   PATCH /api/root-modules/:id/status
//  * @desc    Enable or disable a root system module
//  * @access  Private (Root Admin with ROOT_MODULES:STATUS permission)
//  */
// router.patch(
//   '/:id/status',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'STATUS'),
//   rootModuleController.toggleModuleStatus
// );

// /**
//  * -----------------------------------------
//  * ⚙️ Module Actions Management
//  * -----------------------------------------
//  * Manage fine-grained actions available under each module.
//  */

// /**
//  * @route   POST /api/root-modules/:id/actions
//  * @desc    Add a new action to a root module
//  * @access  Private (Root Admin with ROOT_MODULES:CREATE permission)
//  */
// router.post(
//   '/:id/actions',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'CREATE'),
//   rootModuleController.addAction
// );

// /**
//  * @route   PUT /api/root-modules/:id/actions
//  * @desc    Update an existing action in a root module
//  * @access  Private (Root Admin with ROOT_MODULES:UPDATE permission)
//  */
// router.put(
//   '/:id/actions',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'UPDATE'),
//   rootModuleController.updateAction
// );

// /**
//  * @route   DELETE /api/root-modules/:id/actions
//  * @desc    Delete an action from a root module
//  * @access  Private (Root Admin with ROOT_MODULES:DELETE permission)
//  */
// router.delete(
//   '/:id/actions',
//   authMiddleware,
//   checkPermission('ROOT_MODULES', 'DELETE'),
//   rootModuleController.deleteAction
// );

// module.exports = router;


const express = require('express');
const router = express.Router();
const rootModuleController = require('../controllers/rootmodule.controller');

// Authentication middleware
const authMiddleware = require('../middleware/auth');

// Permission check middleware
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * =========================================
 * 🧩 System Modules Management Routes
 * =========================================
 * Module Key: SYS_MODULES
 */

/**
 * -----------------------------------------
 * 📦 Module CRUD Operations
 * -----------------------------------------
 */

/**
 * @route   POST /api/root-modules/add
 * @desc    Create a new system module
 */
router.post(
  '/add',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_ADD'),
  rootModuleController.createModule
);

/**
 * @route   GET /api/root-modules
 * @desc    Get list of all system modules
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_VIEW'),
  rootModuleController.listModules
);

/**
 * @route   GET /api/root-modules/:id
 * @desc    Get details of a specific system module
 */
router.get(
  '/:id',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_VIEW'),
  rootModuleController.getModule
);

/**
 * @route   PUT /api/root-modules/:id
 * @desc    Update a system module name
 */
router.put(
  '/:id',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_UPDATE'),
  rootModuleController.updateModule
);

/**
 * @route   DELETE /api/root-modules/:id
 * @desc    Disable (soft delete) a system module
 */
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE'),
  rootModuleController.deleteModule
);

/**
 * -----------------------------------------
 * 🔁 Module Status Management
 * -----------------------------------------
 */

/**
 * @route   PATCH /api/root-modules/:id/status
 * @desc    Enable or disable a system module
 */
router.patch(
  '/:id/status',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE'),
  rootModuleController.toggleModuleStatus
);

/**
 * -----------------------------------------
 * ⚙️ Module Actions Management
 * -----------------------------------------
 */

/**
 * @route   POST /api/root-modules/:id/actions
 * @desc    Add a new action to a system module
 */
router.post(
  '/:id/actions',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_ADD_ACTION'),
  rootModuleController.addAction
);

/**
 * @route   PUT /api/root-modules/:id/actions
 * @desc    Update an existing action in a system module
 */
router.put(
  '/:id/actions',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_UPDATE_ACTION'),
  rootModuleController.updateAction
);

/**
 * @route   DELETE /api/root-modules/:id/actions
 * @desc    Disable an action in a system module
 */
router.delete(
  '/:id/actions',
  authMiddleware,
  checkPermission('SYS_MODULES', 'SYS_MODULE_DISABLE_ACTION'),
  rootModuleController.deleteAction
);

module.exports = router;
