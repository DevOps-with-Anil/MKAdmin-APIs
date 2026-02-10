const express = require('express');
const router = express.Router();
const rootModuleController = require('../controllers/rootmodule.controller');

// Authentication middleware
const authMiddleware = require('../middleware/auth');

// Permission check middleware
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * =========================================
 * 🧩 Root System Modules Management Routes
 * =========================================
 * These routes are used by ROOT admins to:
 * - Manage system-wide modules
 * - Define available features
 * - Configure allowed actions per module
 * - Control availability for tenants/affiliates
 */

/**
 * -----------------------------------------
 * 📦 Module CRUD Operations
 * -----------------------------------------
 */

/**
 * @route   POST /api/root-modules/add
 * @desc    Create a new root system module
 * @access  Private (Root Admin with ROOT_MODULES:ADD permission)
 */
router.post(
  '/add',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'ADD'),
  rootModuleController.createModule
);

/**
 * @route   GET /api/root-modules
 * @desc    Get list of all root system modules
 * @access  Private (Root Admin with ROOT_MODULES:VIEW permission)
 */
router.get(
  '/',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'VIEW'),
  rootModuleController.listModules
);

/**
 * @route   GET /api/root-modules/:id
 * @desc    Get details of a specific root module
 * @access  Private (Root Admin with ROOT_MODULES:VIEW permission)
 */
router.get(
  '/:id',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'VIEW'),
  rootModuleController.getModule
);

/**
 * @route   PUT /api/root-modules/:id
 * @desc    Update a root system module
 * @access  Private (Root Admin with ROOT_MODULES:EDIT permission)
 */
router.put(
  '/:id',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'EDIT'),
  rootModuleController.updateModule
);

/**
 * @route   DELETE /api/root-modules/:id
 * @desc    Delete a root system module
 * @access  Private (Root Admin with ROOT_MODULES:DELETE permission)
 */
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'DELETE'),
  rootModuleController.deleteModule
);

/**
 * -----------------------------------------
 * 🔁 Module Status Management
 * -----------------------------------------
 */

/**
 * @route   PATCH /api/root-modules/:id/status
 * @desc    Enable or disable a root system module
 * @access  Private (Root Admin with ROOT_MODULES:STATUS permission)
 */
router.patch(
  '/:id/status',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'STATUS'),
  rootModuleController.toggleModuleStatus
);

/**
 * -----------------------------------------
 * ⚙️ Module Actions Management
 * -----------------------------------------
 * Manage fine-grained actions available under each module.
 */

/**
 * @route   POST /api/root-modules/:id/actions
 * @desc    Add a new action to a root module
 * @access  Private (Root Admin with ROOT_MODULES:CREATE permission)
 */
router.post(
  '/:id/actions',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'CREATE'),
  rootModuleController.addAction
);

/**
 * @route   PUT /api/root-modules/:id/actions
 * @desc    Update an existing action in a root module
 * @access  Private (Root Admin with ROOT_MODULES:UPDATE permission)
 */
router.put(
  '/:id/actions',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'UPDATE'),
  rootModuleController.updateAction
);

/**
 * @route   DELETE /api/root-modules/:id/actions
 * @desc    Delete an action from a root module
 * @access  Private (Root Admin with ROOT_MODULES:DELETE permission)
 */
router.delete(
  '/:id/actions',
  authMiddleware,
  checkPermission('ROOT_MODULES', 'DELETE'),
  rootModuleController.deleteAction
);

module.exports = router;
