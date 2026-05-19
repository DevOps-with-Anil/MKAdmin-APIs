const RootRole = require('../../models/rbac/SystemRole');
const RootUSER = require('../../models/rbac/RootAdmin');
const RootModule = require('../../models/rbac/SystemModule');
const auditLogger = require('../../utils/auditLogger');
const responseFormatter = require('../../utils/responseFormatter');
const MSG = require('../../config/constants/messageKeys');
const CODES = require('../../config/constants/errorCodes');

const { SUPPORTED_LANGS, DEFAULT_LANG } = require('../../utils/i18n');

/**
 * ============================================================
 * 🌍 Helper: Validate localized object dynamically
 * ============================================================
 */
function validateLocalizedField(field, fieldName) {
  for (const lang of SUPPORTED_LANGS) {
    if (!field?.[lang]) {
      return `${fieldName} required for language: ${lang}`;
    }
  }
  return null;
}

/**
 * ============================================================
 * 🌍 Helper: Localize role output dynamically
 * ============================================================
 */
function localizeRole(role, lang) {
  const obj = role.toObject();

  obj.name = obj.name?.[lang] || obj.name?.[DEFAULT_LANG];
  obj.description =
    obj.description?.[lang] || obj.description?.[DEFAULT_LANG];

  if (Array.isArray(obj.modules)) {
    obj.modules = obj.modules.map(mod => ({
      ...mod,
      moduleName:
        mod.moduleName?.[lang] || mod.moduleName?.[DEFAULT_LANG],
      actions: mod.actions?.map(act => ({
        ...act,
        actionName:
          act.actionName?.[lang] || act.actionName?.[DEFAULT_LANG]
      }))
    }));
  }

  return obj;
}

/**
 * ============================================================
 * 🟢 CREATE ROLE
 * ============================================================
 */
exports.createRole = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { name, description, status } = req.body;

    const nameError = validateLocalizedField(name, 'Role name');
    if (nameError) {
      return responseFormatter.error(
        req,
        res,
        400,
        nameError,
        CODES.ROL_400
      );
    }

    const descError = validateLocalizedField(description, 'Role description');
    if (descError) {
      return responseFormatter.error(
        req,
        res,
        400,
        descError,
        CODES.ROL_400
      );
    }

    // Prevent duplicate using DEFAULT_LANG
    const exists = await RootRole.findOne({
      [`name.${DEFAULT_LANG}`]: name[DEFAULT_LANG]
    });

    if (exists) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.ROLE_EXISTS,
        CODES.ROL_409
      );
    }

    const role = await RootRole.create({
      name,
      description,
      modules: [],
      createdBy: req.user?._id,
      status: status
    });

    /**
     * ======================================================
     * 4️⃣ Audit Log (Store English + Full i18n)
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'SYS_ROLE_ADD',
      module: 'SYS_ROLES',
      entityId: role._id,
      entityName: role.name?.[DEFAULT_LANG], // Primary label
      after: role,
      message: MSG.ROLE_CREATED,
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_CREATED,
      localizeRole(role, lang),
      null,
      201
    );

  } catch (err) {
    console.error(err);
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
 * ============================================================
 * 📄 LIST ROLES
 * ============================================================
 */
exports.listRoles = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { page = 1, limit = 20, search = '', status } = req.query;

    const query = {
      isSystemRole: { $ne: true }, // ✅ added
    };

    if (search) {
      query[`name.${DEFAULT_LANG}`] = {
        $regex: search,
        $options: 'i',
      };
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [roles, total] = await Promise.all([
      RootRole.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      RootRole.countDocuments(query),
    ]);

    // ✅ Get role IDs
    const roleIds = roles.map(role => role._id);

    // ✅ Aggregate user count by role
    const userCounts = await RootUSER.aggregate([
      {
        $match: {
          role: { $in: roleIds }, // ✅ FIXED
        },
      },
      {
        $group: {
          _id: "$role", // ✅ FIXED
          count: { $sum: 1 },
        },
      },
    ]);

    // ✅ Convert to map for quick lookup
    const countMap = {};
    userCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    // ✅ Attach count to each role
    const localized = roles.map(role => {
      const data = localizeRole(role, lang);

      return {
        ...data,
        assignedUserCount: countMap[role._id.toString()] || 0,
      };
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_LIST_FETCHED,
      localized,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(req, res, 500, MSG.ROLE_LIST_FAILED);
  }
};

/**
 * ============================================================
 * 🔎 GET ROLE BY ID
 * ============================================================
 */
exports.getRoleById = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;

    const role = await RootRole.findById(req.params.id);
    if (!role) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND
      );
    }

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_FETCHED,
      role,
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_FETCH_FAILED
    );
  }
};

/**
 * ============================================================
 * ✏️ UPDATE ROLE
 * ============================================================
 */
exports.updateRole = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { name, description, status } = req.body;

    const role = await RootRole.findById(req.params.id);
    if (!role) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND
      );
    }

    /**
     * ======================================================
     * 1️⃣ Capture BEFORE snapshot
     * ======================================================
     */
    const beforeData = role.toObject();

    if (name) {
      const nameError = validateLocalizedField(name, 'Role name');
      if (nameError) {
        return responseFormatter.error(
          req,
          res,
          400,
          nameError
        );
      }
      role.name = name;
    }

    if (description) {
      const descError = validateLocalizedField(
        description,
        'Role description'
      );
      if (descError) {
        return responseFormatter.error(
          req,
          res,
          400,
          descError
        );
      }
      role.description = description;
    }

    role.status = status;

    await role.save();

    /**
     * ======================================================
     * 2️⃣ Capture AFTER snapshot
     * ======================================================
     */
    const afterData = role.toObject();

    /**
     * ======================================================
     * 3️⃣ Audit Log with Before & After
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ROLE',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name?.[DEFAULT_LANG],
      before: beforeData,
      after: role,
      message: MSG.ROLE_UPDATED
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_UPDATED,
      localizeRole(role, lang),
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_UPDATE_FAILED
    );
  }
};

/**
 * ============================================================
 * 🔁 UPDATE ROLE STATUS
 * ============================================================
 */
exports.updateRoleStatus = async (req, res) => {
  try {
    const lang = req.language || DEFAULT_LANG;
    let { status } = req.body;

    // ✅ Strict validation: must be string 'ACTIVE' or 'INACTIVE'
    if (typeof status !== 'string' || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.ROLE_STATUS_REQUIRED
      );
    }

    const role = await RootRole.findById(req.params.id);
    if (!role) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND
      );
    }

    /**
     * ======================================================
     * 1️⃣ Capture BEFORE snapshot
     * ======================================================
     */
    const beforeData = {
      status: role.status
    };

    role.status = status;
    await role.save();

    /**
     * ======================================================
     * 2️⃣ Capture AFTER snapshot
     * ======================================================
     */
    const afterData = {
      status: role.status
    };

    /**
     * ======================================================
     * 3️⃣ Audit Log with Before & After
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ROLE_STATUS',
      module: 'ROLES',
      entityId: role._id,
      entityName: role.name?.[DEFAULT_LANG],
      before: beforeData,
      after: afterData,
      message: MSG.ROLE_STATUS_UPDATED
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_STATUS_UPDATED,
      localizeRole(role, lang),
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_STATUS_UPDATE_FAILED
    );
  }
};


/**
 * ============================================================
 * 🗑️ DELETE ROLE
 * ============================================================
 */
exports.deleteRole = async (req, res) => {
  try {
    const lang = req.language || DEFAULT_LANG;

    const role = await RootRole.findById(req.params.id);

    if (!role) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND
      );
    }

    /**
     * ======================================================
     * 1️⃣ Capture BEFORE snapshot
     * ======================================================
     */
    const beforeData = {
      name: role.name,
      description: role.description,
      status: role.status
    };

    /**
     * ======================================================
     * 2️⃣ Delete Role
     * ======================================================
     */
    await role.deleteOne();

    /**
     * ======================================================
     * 3️⃣ Audit Log
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "DELETE_ROLE",
      module: "ROLES",
      entityId: role._id,
      entityName: role.name?.[DEFAULT_LANG],
      before: beforeData,
      after: null,
      message: MSG.ROLE_DELETED
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_DELETED,
      "",
      "",
      201
    );

  } catch (err) {
    console.error(err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_DELETE_FAILED
    );
  }
};

/**
 * ============================================================
 * 🧩 ASSIGN PERMISSIONS
 * ============================================================
 */
exports.assignModulesPermissions = async (req, res) => {
  try {
    const { modules } = req.body;

    // ✅ Validate modules array
    if (!Array.isArray(modules) || modules.length === 0) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.MODULES_ARRAY_REQUIRED
      );
    }

    const role = await RootRole.findById(req.params.id);
    if (!role) {
      return responseFormatter.error(
        req, res,
        404,
        CODES.ROLE_NOT_FOUND,
        MSG.ROLE_NOT_FOUND,
        req.t(MSG.ROLE_NOT_FOUND)
      );
    }

    if (role.isSystemRole) {
      return responseFormatter.error(
        req, res,
        403,
        CODES.CANNOT_MODIFY_SUPER_ADMIN,
        MSG.CANNOT_MODIFY_SUPER_ADMIN,
        req.t(MSG.CANNOT_MODIFY_SUPER_ADMIN)
      );
    }

    // ✅ Extract module keys safely
    const moduleKeys = modules.map(m => {
      if (!m.moduleKey) {
        throw new Error("moduleKey is required");
      }
      return m.moduleKey.toUpperCase();
    });

    // ✅ Fetch all modules in one query (optimized)
    const rootModule = await RootModule.find({
      key: { $in: moduleKeys },
      status: "ACTIVE"
    });

    // ✅ Create lookup map
    const moduleMap = new Map(
      rootModule.map(m => [m.key, m])
    );

    const newModules = [];

    // ✅ Process each module
    for (const mod of modules) {
      const { moduleKey, actions = [] } = mod;

      if (!moduleKey) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.MODULE_KEY_REQUIRED
        );
      }

      const rootModule = moduleMap.get(moduleKey.toUpperCase());

      if (!rootModule) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.INVALID_MODULE_KEY.replace('{moduleKey}', moduleKey)
        );
      }

      const validActions = [];

      // ✅ Validate actions
      for (const act of actions) {
        if (!act.actionKey) {
          return responseFormatter.error(
            req,
            res,
            400,
            MSG.ACTION_KEY_REQUIRED
          );
        }

        const rootAction = rootModule.actions.find(
          a =>
            a.key === act.actionKey.toUpperCase() &&
            a.status === "ACTIVE"
        );

        if (!rootAction) {
          return responseFormatter.error(
            req,
            res,
            400,
            MSG.INVALID_ACTION_KEY.replace('{actionKey}', act.actionKey)
          );
        }

        validActions.push({
          actionKey: rootAction.key,
          actionName: rootAction.actionName,
          allowed: !!act.allowed
        });
      }

      newModules.push({
        moduleKey: rootModule.key,
        moduleName: rootModule.moduleName,
        actions: validActions,
        allowed: mod.allowed
      });
    }

    // ✅ Save to plan
    role.permissions = newModules;
    role.markModified("modules");
    await role.save();

    // ✅ Audit log
    await auditLogger?.({
      req,
      user: req.user,
      action: "ASSIGN_MODULES",
      module: "Roles",
      entityId: role._id,
      entityName: role.name?.[req.lang] || role.name?.[DEFAULT_LANG],
      after: role,
      message: req.t(MSG.MODULES_ASSIGNED)
    });

    // ✅ Success response
    return responseFormatter.success(
      req,
      res,
      MSG.MODULES_ASSIGNED,
      localizeRole(role, req.lang),
      null,
      200
    );
  } catch (err) {
    console.error("Assign modules error:", err);

    // Handle thrown validation errors
    if (err.message === "moduleKey is required") {
      return responseFormatter.error(req, res, 400, err.message);
    }

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.MODULES_ASSIGN_FAILED
    );
  }
};

