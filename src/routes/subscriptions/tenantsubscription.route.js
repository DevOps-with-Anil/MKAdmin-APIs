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

// ASSIGN PLAN TO TENANT
router.post(
  "/assign-plan",
  checkPermission("AFFILIATE_SUBSCRIPTIONS", "AFFILIATE_ASSIGN_PLAN"),
  tenantSubscriptionController.assignPlan
);

// UPDATE TENANT PLAN
router.post(
  "/update-plan",
  checkPermission("AFFILIATE_SUBSCRIPTIONS", "AFFILIATE_UPDATE_PLAN"),
  tenantSubscriptionController.updatePlan
);

// GET ACTIVE SUBSCRIPTION
router.get(
  "/:tenantId",
  checkPermission("AFFILIATE_SUBSCRIPTIONS", "AFFILIATE_VIEW_SUBSCRIPTION"),
  tenantSubscriptionController.getActiveSubscription
);

// CANCEL SUBSCRIPTION
router.post(
  "/cancel",
  checkPermission("AFFILIATE_SUBSCRIPTIONS", "AFFILIATE_CANCEL_SUBSCRIPTION"),
  tenantSubscriptionController.cancelSubscription
);

// SUBSCRIPTION HISTORY
router.get(
  "/history/:tenantId",
  checkPermission("AFFILIATE_SUBSCRIPTIONS", "AFFILIATE_VIEW_SUBSCRIPTION_HISTORY"),
  tenantSubscriptionController.getSubscriptionHistory
);

module.exports = router;