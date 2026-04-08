const router = require('express').Router();

const planController = require('../../controllers/subscriptions/plan.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit');
const validateUser = require('../../middleware/validateUser');


/**
 * ===============================
 * PLAN SECURITY LAYER
 * ===============================
 */

router.use(authMiddleware); // ✅ Apply auth once globally
router.use(validateUser);
router.use(userLimiter());


// // 🔥 Create Plan (Strict Security - Write Operation)
// router.post(
//   '/',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ADD'),
//   planController.createPlan
// );

// // 👁 List Plans (Relaxed Limit - Read Operation)
// router.get(
//   '/',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
//   planController.listPlans
// );

// // 👁 Get Single Plan
// router.get(
//   '/:id',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
//   planController.getPlan
// );

// // 👁 Get Single Plan to edit
// router.get(
//   '/fetch/:id',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
//   planController.getPlantoEdit
// );

// // ✏ Update Plan (Moderate Security)
// router.put(
//   '/:id',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_UPDATE'),
//   planController.updatePlan
// );

// // ❌ Delete Plan (Strict Security)
// router.delete(
//   '/:id',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_DELETE'),
//   planController.deletePlan
// );

// // 🔧 Assign Modules (Sensitive Operation)
// router.post(
//   '/:id/modules',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ASSIGN_FEATURES'),
//   planController.assignModulesPermissions
// );

// Create Plan
router.post(
  '/',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ADD'),
  planController.createPlan
);

// List Plans
router.get(
  '/',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.listPlans
);

// Get Single Plan
router.get(
  '/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.getPlan
);

// Get Plan for Edit
router.get(
  '/fetch/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.getPlantoEdit
);

// Update Plan
router.put(
  '/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_UPDATE'),
  planController.updatePlan
);

// Delete Plan (hard delete)
router.delete(
  '/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_DELETE'),
  planController.deletePlan
);

// // 🔁 Plan Status (recommended)
// router.patch(
//   '/:id/status',
//   checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_STATUS'),
//   planController.togglePlanStatus
// );

// Assign Modules / Features
router.post(
  '/:id/modules',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ASSIGN_FEATURES'),
  planController.assignModulesPermissions
);

module.exports = router;