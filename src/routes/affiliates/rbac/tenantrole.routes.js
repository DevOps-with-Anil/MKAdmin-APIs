const router = require('express').Router();

const authMiddleware = require('../../../middleware/auth');
const ctrl = require('../../../controllers/affiliates/rbac/tenantrole.controller');
const { checkPermission } = require('../../../middleware/permissionMiddleware');
const { userLimiter } = require('../../../config/rateLimit');
const validateUser = require('../../../middleware/validateUser');


router.use(authMiddleware); 
router.use(validateUser);
router.use(userLimiter());

/**
 * =========================================
 * 🎭 CREATE ROLE
 * =========================================
 */

router.post(
  '/',
  checkPermission('ROLES', 'ROLE_CREATE'),
  ctrl.createTenantRole
);

/**
 * =========================================
 * 📄 GET ALL ROLES (BY TENANT)
 * =========================================
 */

router.get(
  '/:tenantId',
  checkPermission('ROLES', 'ROLE_UPDATE'),
  ctrl.getTenantRoles
);

/**
 * =========================================
 * 🔍 GET ROLE BY ID
 * =========================================
 */

router.get(
  '/:id',
  checkPermission('ROLES', 'SYS_ROLE_VIEW'),
  ctrl.getTenantRoleById
);

/**
 * =========================================
 * ✏️ UPDATE ROLE
 * =========================================
 */

router.put(
  '/:id',
  checkPermission('ROLES', 'ROLE_UPDATE'),
  ctrl.updateTenantRole
);

/**
 * =========================================
 * 🗑 DELETE ROLE
 * =========================================
 */

router.delete(
  '/:id',
  checkPermission('ROLES', 'ROLE_DELETE'),
  ctrl.deleteTenantRole
);


// Assign Permissions
router.patch(
  '/:id/permissions',
  checkPermission('ROLES', 'ROLE_ASSIGN_PERMISSION'),
  ctrl.assignPermissions
);

module.exports = router;