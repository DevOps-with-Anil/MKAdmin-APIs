const express = require("express");
const router = express.Router();

const kybController = require("../../controllers/tenants/tenantkyb.controller");
const authMiddleware = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/permissionMiddleware");
const { userLimiter } = require("../../config/rateLimit");
const validateUser = require('../../middleware/validateUser');
const upload = require("../../config/upload");

/* ================= GLOBAL MIDDLEWARE ================= */
router.use(authMiddleware);
router.use(validateUser);
router.use(userLimiter());

/* ============================================================
📄 Upload KYB Documents
============================================================ */
router.post(
  "/upload",
  upload.array("KYBDocs"),
  checkPermission("TENANTS_KYB", "KYB_UPLOAD"),
  kybController.uploadTenantKYB
);

/* ============================================================
📄 View All Tenants KYB Documents
============================================================ */
router.get(
  "/",
  checkPermission("TENANTS_KYB", "KYB_VIEW"),
  kybController.ListTenantKYB
);

/* ============================================================
📄 View KYB Documents
============================================================ */
router.get(
  "/:tenantId",
  checkPermission("TENANTS_KYB", "KYB_VIEW"),
  kybController.viewTenantKYB
);

/* ============================================================
🗑️ DELETE DOCUMENT
============================================================ */
router.post(
  "/document/delete",
  checkPermission("TENANTS_KYB", "KYB_DELETE"),
  kybController.deleteTenantKYBDocument
);

/* ============================================================
🗑️ DELETE FILE
============================================================ */
router.post(
  "/file/delete",
  checkPermission("TENANTS_KYB", "KYB_DELETE"),
  kybController.deleteTenantKYBFile
);

/* ============================================================
📄 Update KYB Documents
============================================================ */
router.post(
  "/update-document",
  checkPermission("TENANTS_KYB", "TENANT_KYB_VERIFY"),
  kybController.updateKYBDocumentStatus
);

module.exports = router;