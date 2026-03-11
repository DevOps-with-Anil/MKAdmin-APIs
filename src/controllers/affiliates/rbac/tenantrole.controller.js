const Tenant = require('../../../models/tenants/Tenant');
const TenantRole = require('../../../models/affiliates/rbac/TenantRole');
const auditLogger = require('../../../utils/auditLogger');
const responseFormatter = require('../../../utils/responseFormatter');

const MSG = require('../../../config/constants/messageKeys');
const CODES = require('../../../config/constants/errorCodes');

const { SUPPORTED_LANGS, DEFAULT_LANG } = require('../../../utils/i18n');

/**
 * ============================================================
 * 🌍 Validate Localized Field
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
 * 🌍 Localize Role Output
 * ============================================================
 */

function localizeRole(role, lang) {
  const obj = role.toObject();

  obj.name = obj.name?.[lang] || obj.name?.[DEFAULT_LANG];
  obj.description =
    obj.description?.[lang] || obj.description?.[DEFAULT_LANG];

  if (Array.isArray(obj.permissions)) {
    obj.permissions = obj.permissions.map(mod => ({
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
 * 🎭 CREATE ROLE
 * ============================================================
 */

exports.createTenantRole = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;
    const { tenantId, name, description, permissions } = req.body;
    const user = req.user;

    /**
     * Validate Tenant
     */

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.TENANT_NOT_FOUND,
        CODES.TEN_404
      );
    }

    /**
     * Validate Multilingual Fields
     */

    const nameError = validateLocalizedField(name, "Role name");
    if (nameError) {
      return responseFormatter.error(req, res, 400, nameError);
    }

    const descError = validateLocalizedField(description, "Role description");
    if (descError) {
      return responseFormatter.error(req, res, 400, descError);
    }

    /**
     * Prevent Duplicate Role
     */

    const exists = await TenantRole.findOne({
      tenantId,
      "name.en": name?.en
    });

    if (exists) {
      return responseFormatter.error(
        req,
        res,
        409,
        MSG.ROLE_EXISTS,
      );
    }

    /**
     * Detect Creator Type
     */

    const createdByType = user?.role?.tenantId ? "TENANT" : "ROOT";

    /**
     * Create Role
     */

    const role = await TenantRole.create({
      tenantId,
      name,
      description,
      permissions: permissions || [],
      createdByType,
      createdBy: user._id
    });

    /**
     * Audit Log
     */

    await auditLogger?.({
      req,
      user,
      action: "ROLE_CREATE",
      module: "TENANT_ROLES",
      entityId: role._id,
      entityName: role.name?.en,
      after: role,
      message: "Role created"
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
 * 📄 GET ROLES (LIST)
 * ============================================================
 */

exports.getTenantRoles = async (req, res) => {

  try {

    const lang = req.lang || DEFAULT_LANG;
    const { page = 1, limit = 20, search = '', status } = req.body;
    const { tenantId } = req.params;



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
      TenantRole.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TenantRole.countDocuments(query)
    ]);


    const data = roles.map(role => localizeRole(role, lang));

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_LIST_FETCHED,
      data,
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
      MSG.ROLE_FETCH_FAILED,
      CODES.ROL_500
    );
  }
};


/**
 * ============================================================
 * 🔍 GET ROLE BY ID
 * ============================================================
 */

exports.getTenantRoleById = async (req, res) => {

  try {

    const lang = req.lang || DEFAULT_LANG;
    const { id } = req.params;

    const role = await TenantRole.findById(id);

    if (!role) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND,
        CODES.ROL_404
      );
    }

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_FETCHED,
      localizeRole(role, lang)
    );

  } catch (err) {

    console.error(err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_FETCH_FAILED,
      CODES.ROL_500
    );
  }
};


/**
 * ============================================================
 * ✏️ UPDATE ROLE
 * ============================================================
 */

exports.updateTenantRole = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { id } = req.params;
    const { name } = req.body; // assuming name contains { en, fr, ar }

    const role = await TenantRole.findById(id);

    if (!role) {
      return responseFormatter.error(req, res, 404, MSG.ROLE_NOT_FOUND);
    }

    if (role.isSystem) {
      return responseFormatter.error(req, res, 403, MSG.ROLE_UPDATE_FAILED);
    }

    // =========================================
    // 1️⃣ Check for duplicate name.en within the same tenant
    // =========================================
    if (name?.en && name.en !== role.name?.en) {
      const existingRole = await TenantRole.findOne({
        tenantId: role.tenantId,
        'name.en': name.en,
        _id: { $ne: role._id } // exclude current role
      });

      if (existingRole) {
        return responseFormatter.error(
          req,
          res,
          409,
          MSG.ROLE_EXISTS
        );
      }
    }

    // =========================================
    // 2️⃣ Save the update
    // =========================================
    const before = role.toObject();
    Object.assign(role, req.body);
    await role.save();

    // =========================================
    // 3️⃣ Audit log
    // =========================================
    await auditLogger?.({
      req,
      user: req.user,
      action: "ROLE_UPDATE",
      module: "TENANT_ROLES",
      entityId: role._id,
      entityName: role.name?.en,
      before,
      after: role,
      message: "Role updated"
    });

    // =========================================
    // 4️⃣ Response
    // =========================================
    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_UPDATED,
      localizeRole(role, lang),
      "",
      201
    );

  } catch (err) {
    console.error('UpdateTenantRole error:', err);
    return responseFormatter.error(req, res, 500, MSG.ROLE_UPDATE_FAILED);
  }
};

/**
 * ============================================================
 * 🗑 DELETE ROLE (SOFT DELETE)
 * ============================================================
 */

exports.deleteTenantRole = async (req, res) => {

  try {

    const { id } = req.params;

    const role = await TenantRole.findById(id);

    if (!role) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND,
        CODES.ROL_404
      );
    }

    if (role.isSystem) {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.SYSTEM_ROLE_CANNOT_DELETE,
        CODES.ROL_403
      );
    }

    role.status = false;
    await role.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: "ROLE_DELETE",
      module: "TENANT_ROLES",
      entityId: role._id,
      entityName: role.name?.en,
      after: role,
      message: "Role deleted"
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ROLE_DELETED
    );

  } catch (err) {

    console.error(err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.ROLE_DELETE_FAILED,
      CODES.ROL_500
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

    const role = await TenantRole.findById(req.params.id);
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

    await TenantRole.updateOne(
      { _id: role._id },
      { $set: { permissions: newPermissions } }
    );

    return responseFormatter.success(
      req,
      res,
      MSG.PERMISSIONS_UPDATED,
      newPermissions,
      "",
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