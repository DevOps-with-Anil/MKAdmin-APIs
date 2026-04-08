const express = require("express");
const router = express.Router();

const tenantController = require("../../controllers/tenants/tenant.controller");
const authMiddleware = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/permissionMiddleware");
const { userLimiter } = require("../../config/rateLimit");
const validateUser = require('../../middleware/validateUser');


/**
 * ===========================================
 * Tenant Routes (Enterprise Security)
 * ===========================================
 */

// Apply authentication once for all routes
router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

// ================= CREATE TENANT =================
router.post(
  "/",
  checkPermission("AFFILIATES", "AFFILIATE_CREATE"),
  tenantController.createTenant
);

// ================= LIST TENANTS =================
router.get(
  "/",
  checkPermission("AFFILIATES", "AFFILIATE_VIEW"),
  tenantController.listTenants
);

// ================= GET TENANT =================
router.get(
  "/:id",
  checkPermission("AFFILIATES", "AFFILIATE_VIEW"),
  tenantController.getTenantById
);

// ================= UPDATE TENANT =================
router.put(
  "/:id",
  checkPermission("AFFILIATES", "AFFILIATE_UPDATE"),
  tenantController.updateTenant
);

// ================= DELETE TENANT =================
router.delete(
  "/:id",
  checkPermission("AFFILIATES", "AFFILIATE_DELETE"),
  tenantController.softDeleteTenant
);

// ================= ASSIGN PLAN =================
router.post(
  "/assign-plan",
  checkPermission("AFFILIATES", "AFFILIATE_ASSIGN_PLAN"),
  tenantController.assignPlanToTenant
);

module.exports = router;