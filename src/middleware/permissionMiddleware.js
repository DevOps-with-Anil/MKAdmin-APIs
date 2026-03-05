
const Role = require('../models/rbac/SystemRole');
const { hasPermission } = require('../utils/rbac');

/**
 * RBAC Middleware Factory
 */
const checkPermission = (moduleKey, actionKey) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const role = await Role.findById(user.role);

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Role not found'
        });
      }

      const allowed = hasPermission(role, moduleKey, actionKey);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      next();

    } catch (error) {
      console.error('RBAC Middleware Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = { checkPermission };