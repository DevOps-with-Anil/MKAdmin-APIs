// const express = require('express');
// const router = express.Router();

// const rootModuleController = require('../../controllers/rbac/tenantmodule.controller');
// const authMiddleware = require('../../middleware/auth');
// const { checkPermission } = require('../../middleware/permissionMiddleware');
// const { userLimiter } = require('../../config/rateLimit'); // ✅ Rate limiter

// const validateUser = require('../../middleware/validateUser');


// router.use(authMiddleware); 
// router.use(validateUser);
// router.use(userLimiter());

// /**
//  * -----------------------------------------
//  * 📦 Module CRUD Operations
//  * -----------------------------------------
//  */
// // Create Module
// router.post(
//   '/add',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_ADD'),
//   rootModuleController.createModule
// );

// // List Modules
// router.get(
//   '/',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_VIEW'),
//   rootModuleController.listModules
// );

// // Get Module
// router.get(
//   '/:id',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_VIEW'),
//   rootModuleController.getModule
// );

// // Update Module
// router.put(
//   '/:id',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_UPDATE'),
//   rootModuleController.updateModule
// );

// // Delete Module (hard delete)
// router.delete(
//   '/:id',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_DELETE'),
//   rootModuleController.deleteModule
// );

// // Module Status
// router.patch(
//   '/:id/status',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_STATUS'),
//   rootModuleController.toggleModuleStatus
// );

// // Add Actions
// router.post(
//   '/:id/actions',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_ADD_ACTION'),
//   rootModuleController.addAction
// );

// // Update Action
// router.put(
//   '/:id/actions/:actionId',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_UPDATE_ACTION'),
//   rootModuleController.updateAction
// );

// // Delete Action
// router.delete(
//   '/:id/actions/:actionId',
//   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_DELETE_ACTION'),
//   rootModuleController.deleteAction
// );

// // // Optional: Toggle Action Status
// // router.patch(
// //   '/:id/actions/:actionId/status',
// //   checkPermission('AFFILIATE_MODULES', 'AFFILIATE_MODULE_STATUS_ACTION'),
// //   rootModuleController.toggleActionStatus
// // );

// module.exports = router;


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

// Create Module
router.post(
  '/add',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_ADD'),
  rootModuleController.createModule
);

// List Modules
router.get(
  '/',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_VIEW'),
  rootModuleController.listModules
);

// Get Module
router.get(
  '/:id',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_VIEW'),
  rootModuleController.getModule
);

// Update Module
router.put(
  '/:id',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_UPDATE'),
  rootModuleController.updateModule
);

// Delete Module (hard delete)
router.delete(
  '/:id',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_DELETE'),
  rootModuleController.deleteModule
);

// Module Status
router.patch(
  '/:id/status',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_STATUS'),
  rootModuleController.toggleModuleStatus
);

// Add Actions
router.post(
  '/:id/actions',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_ADD_ACTION'),
  rootModuleController.addAction
);

// Update Action
router.put(
  '/:id/actions/:actionId',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_UPDATE_ACTION'),
  rootModuleController.updateAction
);

// Delete Action
router.delete(
  '/:id/actions/:actionId',
  checkPermission('TENANT_MODULES', 'TENANT_MODULE_DELETE_ACTION'),
  rootModuleController.deleteAction
);

// Optional: Toggle Action Status
// router.patch(
//   '/:id/actions/:actionId/status',
//   checkPermission('TENANT_MODULES', 'TENANT_MODULE_STATUS_ACTION'),
//   rootModuleController.toggleActionStatus
// );

module.exports = router;