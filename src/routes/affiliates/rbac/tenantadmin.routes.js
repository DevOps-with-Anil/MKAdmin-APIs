/**
 * ============================================================
 * 📦 Tenant Admin Routes
 * ============================================================
 */

const router = require("express").Router();

const authMiddleware = require("../../../middleware/auth");
const { checkPermission } = require("../../../middleware/permissionMiddleware");
const { userLimiter } = require("../../../config/rateLimit");
const ctrl = require("../../../controllers/affiliates/rbac/tenantadmin.controller");
const validateUser = require('../../../middleware/validateUser');


router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

/**
 * ============================================================
 * 🧑‍💼 Tenant Admin Management
 * Module Key: TENANT_ADMIN
 * ============================================================
 */

// Create Tenant Admin
router.post(
  "/",
  checkPermission("TENANT_ADMIN_CREATE"),
  ctrl.createTenantAdmin
);

// Get All Tenant Admins
router.get(
  "/:tenantId",
  checkPermission("TENANT_ADMIN_VIEW"),
  ctrl.getTenantAdmins
);

// Get Single Tenant Admin
router.get(
  "/:id",
  checkPermission("TENANT_ADMIN_VIEW"),
  ctrl.getTenantAdmin
);

// Update Tenant Admin
router.put(
  "/:id",
  checkPermission("TENANT_ADMIN_UPDATE"),
  ctrl.updateTenantAdmin
);

// Change Status
router.patch(
  "/:id/status",
  checkPermission("TENANT_ADMIN_UPDATE_STATUS"),
  ctrl.changeTenantAdminStatus
);

// Delete Tenant Admin
router.delete(
  "/:id",
  checkPermission("TENANT_ADMIN_DELETE"),
  ctrl.deleteTenantAdmin
);

module.exports = router;