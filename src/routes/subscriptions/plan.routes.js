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

// ================= PLAN CRUD =================

// 🔥 Create Plan (Strict Security - Write Operation)
router.post(
  '/',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ADD'),
  planController.createPlan
);

// 👁 List Plans (Relaxed Limit - Read Operation)
router.get(
  '/',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.listPlans
);

// 👁 Get Single Plan
router.get(
  '/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_VIEW'),
  planController.getPlan
);

// ✏ Update Plan (Moderate Security)
router.put(
  '/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_UPDATE'),
  planController.updatePlan
);

// ❌ Delete Plan (Strict Security)
router.delete(
  '/:id',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_DELETE'),
  planController.deletePlan
);

// 🔧 Assign Modules (Sensitive Operation)
router.post(
  '/:id/modules',
  checkPermission('SUBSCRIPTION_PLANS', 'SUB_PLAN_ASSIGN_FEATURES'),
  planController.assignModules
);

module.exports = router;