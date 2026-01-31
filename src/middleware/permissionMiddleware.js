const Role = require('../models/Role');

/**
 * RBAC Permission Middleware
 * Usage: permissionMiddleware('SYSTEM_MODULES', 'VIEW')
 */
module.exports = (moduleCode, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Access denied (no role)' });
      }

      // Load role with permissions
      const role = await Role.findById(user.role).lean();
      if (!role) {
        return res.status(403).json({ message: 'Role not found' });
      }

      const hasPermission = role.permissions?.some(p =>
        p.module === moduleCode &&
        p.actions?.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Forbidden: Missing permission ${moduleCode}:${action}`
        });
      }

      // Hook point for future:
      // - Plan enforcement
      // - Module/Action active check
      // - Feature flags

      next();
    } catch (err) {
      next(err);
    }
  };
};
