const express = require('express');
const router = express.Router();

const affiliateController = require('../../controllers/tenants/affiliate.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { userLimiter } = require('../../config/rateLimit');

/**
 * ===========================================
 * Affiliate Routes (Enterprise Security)
 * ===========================================
 */

router.use(authMiddleware); // ✅ Apply authentication once

// ================= CREATE AFFILIATE =================

router.post(
  '/',
  userLimiter(),
  checkPermission('AFFILIATES', 'AFFILIATE_CREATE'),
  affiliateController.createAffiliate
);

// ================= GET AFFILIATE =================

router.get(
  '/:id',
  userLimiter(),
  checkPermission('AFFILIATES', 'AFFILIATE_VIEW'),
  affiliateController.getAffiliateById
);

// ================= UPDATE AFFILIATE =================

router.put(
  '/:id',
  userLimiter(),
  checkPermission('AFFILIATES', 'AFFILIATE_UPDATE'),
  affiliateController.updateAffiliate
);

// ================= DELETE AFFILIATE =================

router.delete(
  '/:id',
  userLimiter(),
  checkPermission('AFFILIATES', 'AFFILIATE_DELETE'),
  affiliateController.softDeleteAffiliate
);

// ================= LIST AFFILIATES =================

router.get(
  '/',
  userLimiter(),
  checkPermission('AFFILIATES', 'AFFILIATE_VIEW'),
  affiliateController.listAffiliates
);

module.exports = router;