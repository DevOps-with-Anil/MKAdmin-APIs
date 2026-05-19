
const express = require("express");
const router = express.Router();

const kybDocController = require("../../controllers/settings/kybDoc.controller");
const authMiddleware = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/permissionMiddleware");
const { userLimiter } = require("../../config/rateLimit");
const validateUser = require('../../middleware/validateUser');



// ============================================================
// 🔐 GLOBAL MIDDLEWARE
// ============================================================
router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

// ============================================================
// ➕ ADD DOCUMENT TYPE
// ============================================================
router.post(
  "/",
  checkPermission("SETTINGS", "KYB_CREATE"),
  kybDocController.addKYBDocType
);

// ============================================================
// 📄 GET ALL DOCUMENT TYPES (PAGINATED)
// ============================================================
router.get(
  "/",
  checkPermission("SETTINGS", "KYB_VIEW"),
  kybDocController.getKYBDocTypes
);

// ============================================================
// ✏️ UPDATE DOCUMENT TYPE
// ============================================================
router.put(
  "/:id",
  checkPermission("SETTINGS", "KYB_UPDATE"),
  kybDocController.updateKYBDocType
);

// ============================================================
// 🔁 TOGGLE ENABLE / DISABLE
// ============================================================
router.patch(
  "/:id/status",
  checkPermission("SETTINGS", "KYB_UPDATE"),
  kybDocController.toggleKYBDocTypeStatus
);

// ============================================================
// ⭐ TOGGLE REQUIRED STATUS
// ============================================================
router.patch(
  "/:id/required",
  checkPermission("SETTINGS", "KYB_UPDATE"),
  kybDocController.toggleKYBRequiredStatus
);

// ============================================================
// 🗑️ DELETE DOCUMENT TYPE
// ============================================================
router.delete(
  "/:id",
  checkPermission("SETTINGS", "KYB_DELETE"),
  kybDocController.deleteKYBDocType
);

module.exports = router;