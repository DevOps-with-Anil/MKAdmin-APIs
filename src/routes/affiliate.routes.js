const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliate.controller');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissionMiddleware');

// ===========================================
// Affiliate Routes with Auth & Permissions
// ===========================================

// Create a new affiliate
// POST /api/affiliates
router.post(
  '/',
  authMiddleware,                  // Ensure user is authenticated
  checkPermission('AFFILIATES', 'AFFILIATE_CREATE'), // Check RBAC permission
  affiliateController.createAffiliate
);

// Get an affiliate by ID
// GET /api/affiliates/:id
router.get(
  '/:id',
  authMiddleware,
  checkPermission('AFFILIATES', 'AFFILIATE_VIEW'),
  affiliateController.getAffiliateById
);

// Update an affiliate by ID
// PUT /api/affiliates/:id
router.put(
  '/:id',
  authMiddleware,
  checkPermission('AFFILIATES', 'AFFILIATE_UPDATE'),
  affiliateController.updateAffiliate
);

// Soft delete an affiliate by ID
// DELETE /api/affiliates/:id
router.delete(
  '/:id',
  authMiddleware,
  checkPermission('AFFILIATES', 'AFFILIATE_DELETE'),
  affiliateController.softDeleteAffiliate
);

// List affiliates with pagination
// GET /api/affiliates?page=1&limit=10
router.get(
  '/',
  authMiddleware,
  checkPermission('AFFILIATES', 'AFFILIATE_VIEW'),
  affiliateController.listAffiliates
);

// Optional: Restore a soft-deleted affiliate by ID
// PATCH /api/affiliates/:id/restore
// router.patch(
//   '/:id/restore',
//   authMiddleware,
//   checkPermission('AFFILIATES', 'AFFILIATE_RESTORE'),
//   affiliateController.restoreAffiliate
// );

module.exports = router;
