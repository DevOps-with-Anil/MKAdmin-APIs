// const RootRole = require('../models/Role');
// const RootModule = require('../models/RootModule');
// const auditLogger = require('../utils/auditLogger');


// /**
//  * CREATE ROLE
//  */
// exports.create = async (req, res) => {
//   const exists = await RootRole.findOne({ name: req.body.name });
//   if (exists) {
//     return res.status(400).json({ message: 'Role already exists' });
//   }

//   const role = await RootRole.create(req.body);
//   res.json(role);
// };

// /**
//  * LIST ROLES
//  */
// exports.list = async (req, res) => {
//   const roles = await RootRole.find()
//   res.json(roles);
// };

// /**
//  * UPDATE ROLE INFO
//  */
// exports.update = async (req, res) => {
//   const role = await RootRole.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       description: req.body.description
//     },
//     { new: true }
//   );

//   res.json(role);
// };

// /**
//  * UPDATE ROLE STATUS
//  */
// exports.updateStatus = async (req, res) => {
//   const role = await RootRole.findByIdAndUpdate(
//     req.params.id,
//     { status: req.body.status },
//     { new: true }
//   );

//   res.json(role);
// };

// /**
//  * ASSIGN PERMISSIONS TO ROLE
//  */
// exports.assignPermissions = async (req, res) => {
//   try {
//     const roleId = req.params.id;
//     const { modules } = req.body;

//     if (!Array.isArray(modules)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Modules array is required'
//       });
//     }

//     const role = await RootRole.findById(roleId);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     // Protect SUPER_ADMIN
//     if (role.name === 'SUPER_ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'Cannot modify SUPER_ADMIN permissions'
//       });
//     }

//     const newPermissions = [];

//     for (const mod of modules) {
//       let { moduleKey, actions } = mod;

//       if (!moduleKey) {
//         return res.status(400).json({
//           success: false,
//           message: 'moduleKey is required for each module'
//         });
//       }

//       moduleKey = moduleKey.toUpperCase().trim();

//       // 🔥 STRICT CHECK AGAINST COLLECTION
//       const rootModule = await RootModule.findOne({
//         key: moduleKey,
//         isActive: true
//       });

//       if (!rootModule) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid moduleKey:  ${moduleKey}`
//         });
//       }

//       if (!Array.isArray(actions)) {
//         return res.status(400).json({
//           success: false,
//           message: `Actions must be array for module ${moduleKey}`
//         });
//       }

//       const validActions = [];

//       for (const act of actions) {
//         let { actionKey, allowed } = act;

//         if (!actionKey) {
//           return res.status(400).json({
//             success: false,
//             message: `actionKey is required for module ${moduleKey}`
//           });
//         }

//         actionKey = actionKey.toUpperCase().trim();

//         // 🔥 STRICT CHECK AGAINST ROOT MODULE ACTIONS
//         const actionExists = rootModule.actions.some(
//           a => a.key === actionKey && a.isActive
//         );

//         if (!actionExists) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid actionKey: ${actionKey} for module ${moduleKey}`
//           });
//         }

//         validActions.push({
//           actionKey,
//           allowed: !!allowed
//         });
//       }

//       newPermissions.push({
//         moduleKey,
//         actions: validActions
//       });
//     }

//     // Replace permissions
//     role.permissions = newPermissions;
//     role.markModified('permissions');
//     await role.save();

//     await auditLogger?.({
//       req,
//       user: req.user,
//       action: 'ASSIGN_PERMISSIONS',
//       module: 'ROLES',
//       entityId: role._id,
//       entityName: role.name,
//       after: role,
//       message: 'Permissions assigned to role'
//     });

//     return res.json({
//       success: true,
//       message: 'Permissions updated successfully',
//       data: role
//     });

//   } catch (err) {
//     console.error('Assign permissions error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to assign permissions'
//     });
//   }
// };


const RootRole = require('../models/Role');            // Root role model
const RootModule = require('../models/RootModule');   // Root module registry
const auditLogger = require('../utils/auditLogger');  // Audit trail logger
const responseFormatter = require('../utils/responseFormatter'); // Standard API response helper
const MSG = require('../config/constants/messageKeys'); // i18n message keys
const CODES = require('../config/constants/errorCodes'); // Internal error codes

/**
 * Create a new role
 */
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body; // Extract role payload

    if (!name) {
      return responseFormatter.error(req, res, 400, MSG.ROLE_NAME_REQUIRED, CODES.ROL_400); // Name is mandatory
    }

    const exists = await RootRole.findOne({ name: name.trim() }); // Check duplicate role name
    if (exists) {
      return responseFormatter.error(req, res, 400, MSG.ROLE_EXISTS, CODES.ROL_400); // Prevent duplicate role
    }

    const role = await RootRole.create({ 
      name: name.trim(), 
      description 
    }); // Create new role

    await auditLogger?.({
      req,
      user: req.user,                // Actor
      action: 'CREATE_ROLE',         // Audit action
      module: 'ROLES',               // Audit module
      entityId: role._id,            // Affected role ID
      entityName: role.name,         // Affected role name
      after: role,                   // Snapshot after change
      message: 'Role created'        // Audit message
    });

    return responseFormatter.success(req, res, MSG.ROLE_CREATED, role, null, 201); // Success response

  } catch (err) {
    console.error('Create role error:', err); // Log server error
    return responseFormatter.error(req, res, 500, MSG.ROLE_CREATE_FAILED, CODES.ROL_500); // Internal error response
  }
};

/**
 * Get list of all roles (paginated)
 */
exports.listRoles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      roleId = '',
      country = ''
    } = req.body; // Extract filters & pagination

    const query = {}; // MongoDB query builder

    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive name search
    }

    if (status) query.status = status.toUpperCase(); // Optional status filter
    if (roleId) query._id = roleId;                   // Optional roleId filter
    // country reserved for future multi-tenant logic

    const skip = (Number(page) - 1) * Number(limit);  // Pagination offset

    const [roles, total] = await Promise.all([
      RootRole.find(query)
        .sort({ createdAt: -1 })  // Latest first
        .skip(skip)               // Skip for pagination
        .limit(Number(limit)),    // Limit page size
      RootRole.countDocuments(query) // Total count for meta
    ]);

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_LIST_FETCHED,
      roles,
      {
        page: Number(page),
        limit: Number(limit),
        search,
        status,
        roleId,
        country,
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      200
    );

  } catch (err) {
    console.error('List roles error:', err); // Log error
    return responseFormatter.error(req, res, 500, MSG.ROLE_LIST_FAILED); // Error response
  }
};

/**
 * Update role basic info
 */
exports.updateRole = async (req, res) => {
  try {
    const { name, description } = req.body; // Extract update fields

    const role = await RootRole.findById(req.params.id); // Load role
    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND); // Role not found
    }

    if (name) role.name = name.trim();        // Update role name
    if (description !== undefined) role.description = description; // Update description

    await role.save(); // Persist changes

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ROLE',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name,
      after: role,
      message: 'Role updated'
    });

    return responseFormatter.success(req, res, MSG.ROLE_UPDATED, role); // Success response

  } catch (err) {
    console.error('Update role error:', err); // Log error
    return responseFormatter.error(req, res, 500, MSG.ROLE_UPDATE_FAILED); // Error response
  }
};

/**
 * Update role status (ACTIVE / INACTIVE)
 */
exports.updateRoleStatus = async (req, res) => {
  try {
    const { status } = req.body; // Extract status

    if (!status) {
      return responseFormatter.error(req, res, 400, MSG.ROLE_STATUS_REQUIRED); // Status is required
    }

    const role = await RootRole.findById(req.params.id); // Load role
    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND); // Role not found
    }

    role.status = status.toUpperCase(); // Normalize + set status
    await role.save();                  // Persist

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ROLE_STATUS',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name,
      after: role,
      message: 'Role status updated'
    });

    return responseFormatter.success(req, res, MSG.ROLE_STATUS_UPDATED, role); // Success response

  } catch (err) {
    console.error('Update role status error:', err); // Log error
    return responseFormatter.error(req, res, 500, MSG.ROLE_STATUS_UPDATE_FAILED); // Error response
  }
};

/**
 * Assign module + action permissions to role
 */
exports.assignPermissions = async (req, res) => {
  try {
    const roleId = req.params.id; // Role ID from URL
    const { modules } = req.body; // Modules + actions payload

    if (!Array.isArray(modules)) {
      return responseFormatter.error(req, res, 400, MSG.MODULES_ARRAY_REQUIRED); // Must be array
    }

    const role = await RootRole.findById(roleId); // Load role
    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND); // Role not found
    }

    if (role.name === 'SUPER_ADMIN') {
      return responseFormatter.error(req, res, 403, MSG.CANNOT_MODIFY_SUPER_ADMIN); // Protect super admin
    }

    const newPermissions = []; // Build fresh permissions array

    for (const mod of modules) {
      let { moduleKey, actions } = mod; // Extract module + actions

      if (!moduleKey) {
        return responseFormatter.error(req, res, 400, MSG.MODULE_KEY_REQUIRED); // Module key required
      }

      moduleKey = moduleKey.toUpperCase().trim(); // Normalize module key

      const rootModule = await RootModule.findOne({ 
        key: moduleKey, 
        isActive: true 
      }); // Validate module exists and active

      if (!rootModule) {
        return responseFormatter.error(
          req, 
          res, 
          400, 
          MSG.INVALID_MODULE_KEY.replace('{moduleKey}', moduleKey)
        ); // Invalid module
      }

      if (!Array.isArray(actions)) {
        return responseFormatter.error(
          req, 
          res, 
          400, 
          MSG.ACTIONS_ARRAY_REQUIRED.replace('{moduleKey}', moduleKey)
        ); // Actions must be array
      }

      const validActions = []; // Collect validated actions

      for (const act of actions) {
        let { actionKey, allowed } = act; // Extract action

        if (!actionKey) {
          return responseFormatter.error(
            req, 
            res, 
            400, 
            MSG.ACTION_KEY_REQUIRED.replace('{moduleKey}', moduleKey)
          ); // Action key required
        }

        actionKey = actionKey.toUpperCase().trim(); // Normalize action key

        const actionExists = rootModule.actions.some(
          a => a.key === actionKey && a.isActive
        ); // Validate action exists in root module

        if (!actionExists) {
          return responseFormatter.error(
            req, 
            res, 
            400, 
            MSG.INVALID_ACTION_KEY
              .replace('{actionKey}', actionKey)
              .replace('{moduleKey}', moduleKey)
          ); // Invalid action
        }

        validActions.push({ 
          actionKey, 
          allowed: !!allowed 
        }); // Push validated action permission
      }

      newPermissions.push({ 
        moduleKey, 
        actions: validActions 
      }); // Push validated module permissions
    }

    role.permissions = newPermissions;     // Replace permissions
    role.markModified('permissions');      // Force mongoose change tracking
    await role.save();                     // Persist permissions

    await auditLogger?.({
      req,
      user: req.user,
      action: 'ASSIGN_PERMISSIONS',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name,
      after: role,
      message: 'Permissions assigned to role'
    });

    return responseFormatter.success(req, res, MSG.PERMISSIONS_UPDATED, role); // Success response

  } catch (err) {
    console.error('Assign permissions error:', err); // Log error
    return responseFormatter.error(req, res, 500, MSG.PERMISSIONS_ASSIGN_FAILED); // Error response
  }
};
