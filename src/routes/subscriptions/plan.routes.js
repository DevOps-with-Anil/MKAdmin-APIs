const router = require('express').Router();

const planController = require('../../controllers/subscriptions/plan.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit');

/**
 * ===============================
 * PLAN SECURITY LAYER
 * ===============================
 */

router.use(authMiddleware); // ✅ Apply auth once globally

// ================= PLAN CRUD =================

// 🔥 Create Plan (Strict Security - Write Operation)
router.post(
  '/',
  userLimiter(),
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ADD'),
  planController.createPlan
);

// 👁 List Plans (Relaxed Limit - Read Operation)
router.get(
  '/',
  userLimiter(),
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.listPlans
);

// 👁 Get Single Plan
router.get(
  '/:id',
  userLimiter(),
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.getPlan
);

// ✏ Update Plan (Moderate Security)
router.put(
  '/:id',
  userLimiter(),
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_UPDATE'),
  planController.updatePlan
);

// ❌ Delete Plan (Strict Security)
router.delete(
  '/:id',
  userLimiter(),
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_DELETE'),
  planController.deletePlan
);

// 🔧 Assign Modules (Sensitive Operation)
router.post(
  '/:id/modules',
  userLimiter(),
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ASSIGN_FEATURES'),
  planController.assignModules
);

module.exports = router;