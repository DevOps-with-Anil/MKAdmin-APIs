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
    let { name, description } = req.body;

    /**
     * ======================================================
     * 1️⃣ Normalize i18n Payload (Backward Compatible)
     * ======================================================
     * Accept both:
     * - "name": "Super Admin"
     * - "name": { en, fr, ar }
     */

    // Normalize name
    if (typeof name === 'string') {
      name = {
        en: name.trim(),
        fr: name.trim(),
        ar: name.trim()
      };
    }

    // Normalize description
    if (typeof description === 'string') {
      description = {
        en: description.trim(),
        fr: description.trim(),
        ar: description.trim()
      };
    }

    if (!name?.en) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.ROLE_NAME_REQUIRED,
        CODES.ROL_400
      );
    }

    /**
     * ======================================================
     * 2️⃣ Prevent Duplicate Role (English as primary key)
     * ======================================================
     */
    const exists = await RootRole.findOne({
      'name.en': name.en
    });

    if (exists) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.ROLE_EXISTS,
        CODES.ROL_400
      );
    }

    /**
     * ======================================================
     * 3️⃣ Create Role (i18n)
     * ======================================================
     */
    const role = await RootRole.create({
      name: {
        en: name.en.trim(),
        fr: name.fr?.trim() || name.en.trim(),
        ar: name.ar?.trim() || name.en.trim()
      },
      description: {
        en: description?.en?.trim() || '',
        fr: description?.fr?.trim() || description?.en?.trim() || '',
        ar: description?.ar?.trim() || description?.en?.trim() || ''
      }
    });

    /**
     * ======================================================
     * 4️⃣ Audit Log (Store English + Full i18n)
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_ROLE',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name.en, // Primary label
      after: role,
      message: 'Role created',
      meta: {
        name: role.name,
        description: role.description
      }
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_CREATED,
      role,
      null,
      201
    );

  } catch (err) {
    console.error('Create role error:', err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_CREATE_FAILED,
      CODES.ROL_500
    );
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
    let { name, description } = req.body;

    const role = await RootRole.findById(req.params.id);
    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND);
    }

    /**
     * ======================================================
     * 1️⃣ Normalize & Merge i18n Fields (Backward Compatible)
     * ======================================================
     */

    // Normalize name
    if (typeof name === 'string') {
      name = {
        en: name.trim(),
        fr: name.trim(),
        ar: name.trim()
      };
    }

    // Normalize description
    if (typeof description === 'string') {
      description = {
        en: description.trim(),
        fr: description.trim(),
        ar: description.trim()
      };
    }

    /**
     * ======================================================
     * 2️⃣ Prevent Duplicate Role Name (EN)
     * ======================================================
     */
    if (name?.en && name.en !== role.name.en) {
      const exists = await RootRole.findOne({
        _id: { $ne: role._id },
        'name.en': name.en
      });

      if (exists) {
        return responseFormatter.error(req, res, 400, MSG.ROLE_EXISTS);
      }
    }

    /**
     * ======================================================
     * 3️⃣ Merge Instead of Overwrite (Partial Update Safe)
     * ======================================================
     */

    if (name) {
      role.name = {
        ...role.name,
        ...name
      };
    }

    if (description) {
      role.description = {
        ...role.description,
        ...description
      };
    }

    await role.save();

    /**
     * ======================================================
     * 4️⃣ Audit Log (Primary + Full i18n)
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ROLE',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name.en, // English primary
      after: role,
      message: 'Role updated',
      meta: {
        name: role.name,
        description: role.description
      }
    });

    return responseFormatter.success(req, res, MSG.ROLE_UPDATED, role, '', 201);

  } catch (err) {
    console.error('Update role error:', err);
    return responseFormatter.error(req, res, 500, MSG.ROLE_UPDATE_FAILED);
  }
};


/**
 * Update role status (ACTIVE / INACTIVE)
 */
exports.updateRoleStatus = async (req, res) => {
  try {
    const { status } = req.body; // Extract status (Boolean)

    // Validate explicitly (allow false)
    if (typeof status !== 'boolean') {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.ROLE_STATUS_REQUIRED
      );
    }

    const role = await RootRole.findById(req.params.id); // Load role
    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND);
    }

    role.status = status;   // ✅ Boolean assignment
    await role.save();     // Persist

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ROLE_STATUS',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name?.en || role.name, // i18n safe
      after: { status: role.status },
      message: `Role status updated to ${status ? 'ACTIVE' : 'INACTIVE'}`
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_STATUS_UPDATED,
      role,
      null,
      201 
    );

  } catch (err) {
    console.error('Update role status error:', err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_STATUS_UPDATE_FAILED
    );
  }
};


/**
 * Assign module + action permissions to role
 */
exports.assignPermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return responseFormatter.error(req, res, 400, MSG.MODULES_ARRAY_REQUIRED);
    }

    const role = await RootRole.findById(roleId);
    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND);
    }

    // 🛡️ Protect ROOT / SUPER ADMIN (i18n-safe)
    const roleNameEn = role.name?.en || '';
    if (roleNameEn === 'ROOT ADMIN' || roleNameEn === 'SUPER ADMIN') {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.CANNOT_MODIFY_SUPER_ADMIN
      );
    }

    const newPermissions = [];

    for (const mod of modules) {
      let { moduleKey, actions } = mod;

      if (!moduleKey) {
        return responseFormatter.error(req, res, 400, MSG.MODULE_KEY_REQUIRED);
      }

      moduleKey = moduleKey.toUpperCase().trim();

      const rootModule = await RootModule.findOne({
        key: moduleKey,
        isActive: true
      });

      if (!rootModule) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.INVALID_MODULE_KEY.replace('{moduleKey}', moduleKey)
        );
      }

      if (!Array.isArray(actions)) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.ACTIONS_ARRAY_REQUIRED.replace('{moduleKey}', moduleKey)
        );
      }

      const validActions = [];

      for (const act of actions) {
        let { actionKey, allowed } = act;

        if (!actionKey) {
          return responseFormatter.error(
            req,
            res,
            400,
            MSG.ACTION_KEY_REQUIRED.replace('{moduleKey}', moduleKey)
          );
        }

        actionKey = actionKey.toUpperCase().trim();

        const actionExists = rootModule.actions.some(
          a => a.key === actionKey && a.isActive
        );

        if (!actionExists) {
          return responseFormatter.error(
            req,
            res,
            400,
            MSG.INVALID_ACTION_KEY
              .replace('{actionKey}', actionKey)
              .replace('{moduleKey}', moduleKey)
          );
        }

        validActions.push({
          actionKey,
          allowed: !!allowed
        });
      }

      newPermissions.push({
        moduleKey,
        allowed: true,           // ✅ Explicit module-level allow
        actions: validActions
      });
    }

    role.permissions = newPermissions;
    role.markModified('permissions');
    await role.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'ASSIGN_PERMISSIONS',
      module: 'ROLES',
      entityId: role._id,

      // 🌍 Use English for audit consistency
      entityName: role.name?.en,

      after: newPermissions,
      message: 'Permissions assigned to role'
    });

    return responseFormatter.success(
      req,
      res,
      MSG.PERMISSIONS_UPDATED,
      role
    );

  } catch (err) {
    console.error('Assign permissions error:', err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.PERMISSIONS_ASSIGN_FAILED
    );
  }
};
