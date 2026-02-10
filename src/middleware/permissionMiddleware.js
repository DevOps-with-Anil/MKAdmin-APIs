const Role = require('../models/Role');

// =========================================
// 🔐 Permission Check Middleware (RBAC)
// =========================================
// Validates whether the logged-in user
// has access to a specific module/action.
//
// Usage:
// checkPermission('MODULE_KEY', 'ACTION_KEY')

const checkPermission = (moduleKey, actionKey) => {
  return async (req, res, next) => {

    // Debug log for permission checks
    console.log('🔐 Check Permission:', moduleKey, actionKey);

    try {
      // Extract authenticated user from request
      const user = req.user;

      // Block if user or role is missing
      if (!user || !user.role) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Load full role with permissions
      const role = await Role.findById(user.role);

      // Block if role does not exist
      if (!role) {
        return res.status(403).json({ success: false, message: 'Role not found' });
      }

      // System role or ROOT ADMIN bypass (full access)
      if (role.isSystemRole === true || role.name === 'ROOT ADMIN') {
        return next();
      }

      // Check module and action permissions
      const hasPermission = role.permissions.some(p => 
        // Match module key or wildcard
        (p.moduleKey === moduleKey || p.moduleKey === '*') &&
        p.allowed === true &&
        // Match action key or wildcard
        p.actions?.some(a => 
          (a.actionKey === actionKey || a.actionKey === '*') &&
          a.allowed === true
        )
      );

      // Block if permission not granted
      if (!hasPermission) {
        return res.status(403).json({ success: false, message: 'Permission denied' });
      }

      // Permission granted, continue
      next();

    } catch (err) {
      // Log unexpected middleware errors
      console.error('Permission middleware error:', err);

      // Return generic server error
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};

module.exports = { checkPermission };
