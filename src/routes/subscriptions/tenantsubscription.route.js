const express = require("express");
const router = express.Router();

const tenantSubscriptionController = require("../../controllers/subscriptions/tenantsubscription.controller");

const authMiddleware = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/permissionMiddleware");
const { userLimiter } = require("../../config/rateLimit");

const validateUser = require('../../middleware/validateUser');


/**
 * ===============================
 * Subscriptin SECURITY LAYER
 * ===============================
 */

router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

/**
 * ===========================================
 * ASSIGN PLAN TO TENANT
 * ===========================================
 */

router.post(
  "/assign-plan",
  checkPermission("TENANTS", "TENANT_ASSIGN_PLAN"),
  tenantSubscriptionController.assignPlan
);

/**
 * ===========================================
 * UPDATE TENANT PLAN
 * ===========================================
 */

router.post(
  "/update-plan",
  checkPermission("TENANTS", "TENANT_UPDATE_PLAN"),
  tenantSubscriptionController.updatePlan
);

/**
 * ===========================================
 * GET ACTIVE SUBSCRIPTION
 * ===========================================
 */

router.get(
  "/:tenantId",
  checkPermission("TENANTS", "TENANT_VIEW"),
  tenantSubscriptionController.getActiveSubscription
);

/**
 * ===========================================
 * CANCEL SUBSCRIPTION
 * ===========================================
 */

router.post(
  "/cancel",
  checkPermission("TENANTS", "TENANT_CANCEL_SUBSCRIPTION"),
  tenantSubscriptionController.cancelSubscription
);

/**
 * ===========================================
 * SUBSCRIPTION HISTORY
 * ===========================================
 */

router.get(
  "/history/:tenantId",
  checkPermission("TENANTS", "TENANT_VIEW"),
  tenantSubscriptionController.getSubscriptionHistory
);

module.exports = router;