const router = require('express').Router();
const planController = require('../controllers/plan.controller');
const authMiddleware = require('../middleware/auth'); // Auth middleware to verify JWT token
const { checkPermission } = require('../middleware/permissionMiddleware'); // Permission check middleware

// ================= PLAN CRUD =================

// Create plan (requires SUB_PLAN_ADD permission)
router.post(
  '/',
  authMiddleware, // Authenticate user
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ADD'), // User must have Create Plan permission
  planController.createPlan
);

// List plans (requires SUB_PLAN_VIEW permission)
router.get(
  '/',
  authMiddleware,
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'), // User must have View Plans permission
  planController.listPlans
);

// Get single plan by ID (requires SUB_PLAN_VIEW permission)
router.get(
  '/:id',
  authMiddleware,
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'), // View single plan
  planController.getPlan
);

// Update plan (requires SUB_PLAN_UPDATE permission)
router.put(
  '/:id',
  authMiddleware,
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_UPDATE'), // Update plan permission
  planController.updatePlan
);

// Delete plan (requires SUB_PLAN_DELETE permission)
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_DELETE'), // Delete plan permission
  planController.deletePlan
);

// Assign modules & actions to a plan (requires SUB_PLAN_ASSIGN_FEATURES)
router.post(
  '/:id/modules',
  authMiddleware,
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ASSIGN_FEATURES'), // Assign plan modules & actions
  planController.assignModules
);

module.exports = router;
