
const express = require("express");
const router = express.Router();

const tenantController = require("../../controllers/tenants/tenant.controller");
const authMiddleware = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/permissionMiddleware");
const { userLimiter } = require("../../config/rateLimit");
const validateUser = require('../../middleware/validateUser');
const upload = require("../../config/upload");


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
  checkPermission("TENANTS", "TENANT_CREATE"),
  tenantController.createTenant
);

// ================= LIST TENANTS =================
router.get(
  "/",
  checkPermission("TENANTS", "TENANT_VIEW"),
  tenantController.listTenants
);

// ================= GET TENANT =================
router.get(
  "/:id",
  checkPermission("TENANTS", "TENANT_VIEW"),
  tenantController.getTenantById
);

// ================= GET TENANT TO EDIT =================
router.get(
  "/fetch/:id",
  checkPermission("TENANTS", "TENANT_VIEW"),
  tenantController.getTenantByIdtoEdit
);

// ================= UPDATE TENANT =================
router.put(
  "/:id",
  checkPermission("TENANTS", "TENANT_UPDATE"),
  tenantController.updateTenant
);

// ================= UPDATE TENANT LOGO =================
router.put(
  "/updateTenantLogo/:id", 
  authMiddleware, 
  upload.single("tenantLogo"), 
  tenantController.updateTenantLogo
);


// ================= DELETE TENANT =================
router.delete(
  "/:id",
  checkPermission("TENANTS", "TENANT_DELETE"),
  tenantController.softDeleteTenant
);

// ================= ASSIGN PLAN =================
router.post(
  "/assign-plan",
  checkPermission("TENANTS", "TENANT_ASSIGN_PLAN"),
  tenantController.assignPlanToTenant
);

module.exports = router;