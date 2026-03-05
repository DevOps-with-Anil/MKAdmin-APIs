const RootRole = require('../../models/rbac/SystemRole');
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
    const { name, description } = req.body;

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
      modules: []
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
    const { page = 1, limit = 20, search = '', status } = req.body;

            console.log("+++++++++++++Request Language :   " +req.lang);


    const query = {};

    if (search) {
      query[`name.${DEFAULT_LANG}`] = {
        $regex: search,
        $options: 'i'
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
      RootRole.countDocuments(query)
    ]);

    const localized = roles.map(role =>
      localizeRole(role, lang)
    );



    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_LIST_FETCHED,
      localized,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      201
    );
    

  } catch (err) {
    console.error(err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_LIST_FAILED
    );
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
    const { name, description } = req.body;

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
      before: {
        name: beforeData.name,
        description: beforeData.description
      },
      after: {
        name: afterData.name,
        description: afterData.description
      },
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

    // ✅ Strict validation
    if (typeof status !== 'boolean') {
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
 * 🧩 ASSIGN PERMISSIONS
 * ============================================================
 */
exports.assignPermissions = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { modules } = req.body;

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

    if (role.name?.[DEFAULT_LANG]?.toUpperCase() === 'SUPER ADMIN') {
      return responseFormatter.error(
        req, res,
        403,
        CODES.CANNOT_MODIFY_SUPER_ADMIN,
        MSG.CANNOT_MODIFY_SUPER_ADMIN,
        req.t(MSG.CANNOT_MODIFY_SUPER_ADMIN)
      );
    }

    if (!Array.isArray(modules) || modules.length === 0) {
      return responseFormatter.error(
        req, res,
        400,
        CODES.MODULES_ARRAY_REQUIRED,
        MSG.MODULES_ARRAY_REQUIRED,
        req.t(MSG.MODULES_ARRAY_REQUIRED)
      );
    }

    const newPermissions = [];

    for (const mod of modules) {

      const rootModule = await RootModule.findOne({
        key: { $regex: new RegExp(`^${mod.moduleKey}$`, 'i') },
        isActive: true
      });

      if (!rootModule) {
        return responseFormatter.error(
          req, res,
          400,
          CODES.INVALID_MODULE_KEY,
          MSG.INVALID_MODULE_KEY,
          req.t(MSG.INVALID_MODULE_KEY)
        );
      }

      const moduleSnapshot = {
        moduleKey: rootModule.key,
        moduleName: rootModule.moduleName,   // ✅ STORED
        allowed: Boolean(mod.allowed),
        actions: []
      };

      for (const act of mod.actions) {

        const action = rootModule.actions.find(
          a =>
            a.key.toLowerCase() === act.actionKey.toLowerCase() &&
            a.isActive
        );

        if (!action) {
          return responseFormatter.error(
            req, res,
            400,
            CODES.INVALID_ACTION_KEY,
            MSG.INVALID_ACTION_KEY,
            req.t(MSG.INVALID_ACTION_KEY)
          );
        }

        moduleSnapshot.actions.push({
          actionKey: action.key,
          actionName: action.actionName,   // ✅ STORED
          allowed: Boolean(act.allowed)
        });
      }

      newPermissions.push(moduleSnapshot);
    }

    await RootRole.updateOne(
      { _id: role._id },
      { $set: { permissions: newPermissions } }
    );

    return responseFormatter.success(
      req,
      res,
      CODES.PERMISSIONS_UPDATED,
      MSG.PERMISSIONS_UPDATED,
      newPermissions,
      200
    );

  } catch (err) {
    console.error('Assign Permission Error:', err);

    return responseFormatter.error(
      req,
      res,
      500,
      CODES.PERMISSIONS_ASSIGN_FAILED,
      MSG.PERMISSIONS_ASSIGN_FAILED,
      req.t(MSG.PERMISSIONS_ASSIGN_FAILED)
    );
  }
};