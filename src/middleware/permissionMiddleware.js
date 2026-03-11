
// const Role = require('../models/rbac/SystemRole');
// const TenantRole = require('../models/affiliates/rbac/TenantRole');
// const { hasPermission } = require('../utils/rbac');

// /**
//  * RBAC Middleware Factory
//  */
// const checkPermission = (moduleKey, actionKey) => {
//   return async (req, res, next) => {
//     try {
//       const user = req.user;

//       if (!user || !user.role) {
//         return res.status(401).json({
//           success: false,
//           message: 'Unauthorized'
//         });
//       }

//       const role = await Role.findById(user.role);

//       if (!role) {
//         return res.status(403).json({
//           success: false,
//           message: 'Role not found'
//         });
//       }

//       const allowed = hasPermission(role, moduleKey, actionKey);

//       if (!allowed) {
//         return res.status(403).json({
//           success: false,
//           message: 'Permission denied'
//         });
//       }

//       next();

//     } catch (error) {
//       console.error('RBAC Middleware Error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error'
//       });
//     }
//   };
// };


// module.exports = { checkPermission };

const Role = require('../models/rbac/SystemRole');
const TenantRole = require('../models/affiliates/rbac/TenantRole');
const { hasPermission } = require('../utils/rbac');

/**
 * RBAC Middleware Factory
 */
const checkPermission = (moduleKey, actionKey) => {
  
  
  
  return async (req, res, next) => {

    console.log(moduleKey + "   "+ actionKey);
    try {

      const user = req.user;

      if (!user || !user.role) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      let role;
 
      /**
       * ==============================
       * Detect Role Type
       * ==============================
       */

      if (user.tenantId) {
        // Tenant Admin Role
        role = await TenantRole.findById(user.role);
      } else {
        // Root/System Role
        role = await Role.findById(user.role);
      }

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Role not found'
        });
      }

      /**
       * ==============================
       * Permission Check
       * ==============================
       */

      const allowed = hasPermission(role, moduleKey, actionKey);

      console.log("Allowed  " + allowed);

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