/**
 * ============================================================
 * 📦 Tenant Admin Controller
 * ============================================================
 */

const Tenant = require("../../../models/tenants/Tenant");
const TenantAdmin = require("../../../models/affiliates/rbac/TenantAdmin");
const TenantRole = require("../../../models/affiliates/rbac/TenantRole");
const MSG = require("../../../config/constants/messageKeys");
const CODES = require("../../../config/constants/errorCodes");
const responseFormatter = require('../../../utils/responseFormatter');
const auditLogger = require("../../../utils/auditLogger");

const { SUPPORTED_LANGS, DEFAULT_LANG } = require("../../../utils/i18n");
const errorCodes = require("../../../config/constants/errorCodes");

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
 * 🌍 Localize Tenant Admin Output
 * ============================================================
 */
function localizeTenantAdmin(admin, lang) {
  const obj = admin.toObject();

  if (obj.name && typeof obj.name === "object") {
    obj.name = obj.name?.[lang] || obj.name?.[DEFAULT_LANG];
  }

  return obj;
}

/**
 * ============================================================
 * CREATE TENANT ADMIN
 * ============================================================
 */
exports.createTenantAdmin = async (req, res) => {

  try {
    const user = req.user;

    const {
      tenantId,
      name,
      email,
      phoneCode,
      phoneNumber,
      password,
      role,
      allowedCountries
    } = req.body;

    /**
    * ===============================
    * Check Tenant Exists
    * ===============================
    */

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.TENANT_NOT_FOUND,
        CODES.TENANT_NOT_FOUND
      );
    }

    /**
     * ===============================
     * Check Role Exists
     * ===============================
     */

    const roleExists = await TenantRole.findOne({
      _id: role,
      tenantId
    });

    if (!roleExists) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.ROLE_NOT_FOUND,
        CODES.ROLE_NOT_FOUND
      );
    }

    /**
     * ===============================
     * Check Email Already Exists
     * ===============================
     */

    const exists = await TenantAdmin.findOne({ tenantId, email });

    if (exists) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_EMAIL_EXISTS,
        CODES.USER_EMAIL_EXISTS
      );
    }

    /**
     * ===============================
     * Created By Type
     * ===============================
     */

    const createdByType = user?.tenantId ? "TENANT" : "ROOT";

    /**
     * ===============================
     * Create Tenant Admin
     * ===============================
     */

    const admin = await TenantAdmin.create({
      tenantId,
      name,
      email,
      phoneCode,
      phoneNumber,
      password,
      role,
      allowedCountries,
      createdByType,
      createdBy: user?._id
    });

    /**
     * ===============================
     * Audit Log
     * ===============================
     */
    await auditLogger?.({
      req,
      user,
      action: "TENANT_ADMIN_CREATED",
      module: "TENANT_ADMIN",
      entityId: tenant._id,
      entityName: tenant.companyName?.en,
      after: admin,
      message: "Admin created"
    });


    /**
     * ===============================
     * Success Response
     * ===============================
     */

    return responseFormatter.success(
      req,
      res,
      MSG.USER_CREATED,
      admin,
      null,
      201
    );

  } catch (err) {

    console.error("Create Tenant Admin Error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_CREATE_FAILED,
      CODES.USER_CREATE_FAILED
    );
  }
};

/**
 * ============================================================
 * GET ALL TENANT ADMINS
 * ============================================================
 */
exports.getTenantAdmins = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;

    const { page = 1, limit = 20, search = '', status } = req.body;
    const { tenantId } = req.params;

    const query = { tenantId };

    /**
     * ===============================
     * Search
     * ===============================
     */

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { [`name.${DEFAULT_LANG}`]: { $regex: search, $options: 'i' } }
      ];
    }

    /**
     * ===============================
     * Status Filter
     * ===============================
     */

    if (status) {
      query.status = status.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    /**
     * ===============================
     * Fetch Data
     * ===============================
     */

    const [admins, total] = await Promise.all([
      TenantAdmin.find(query)
        .populate("role", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      TenantAdmin.countDocuments(query)
    ]);

    /**
     * ===============================
     * Localize Data
     * ===============================
     */

    const data = admins.map(admin => ({
      ...admin.toObject(),
      name: admin.name?.[lang] || admin.name?.[DEFAULT_LANG],
      role: admin.role ? localizeTenantAdmin(admin.role, lang) : null
    }));

    /**
     * ===============================
     * Response
     * ===============================
     */

    return responseFormatter.success(
      req,
      res,
      MSG.USER_LIST_FETCHED,
      data,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      200
    );

  } catch (err) {

    console.error(err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_FETCH_FAILED,
      CODES.USER_500
    );
  }
};

/**
 * ============================================================
 * GET SINGLE TENANT ADMIN
 * ============================================================
 */
exports.getTenantAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.lang || DEFAULT_LANG;

    const admin = await TenantAdmin.findById(id).populate("role");

    if (!admin) {
      return res
        .status(404)
        .json(error(MSG.NOT_FOUND, CODES.NOT_FOUND));
    }

    const localized = localizeTenantAdmin(admin, lang);

    return res.json(success(MSG.FETCHED, localized));
  } catch (err) {
    return res
      .status(500)
      .json(error(MSG.SERVER_ERROR, CODES.SERVER_ERROR, err.message));
  }
};

/**
 * ============================================================
 * UPDATE TENANT ADMIN
 * ============================================================
 */
exports.updateTenantAdmin = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;

    const admin = await TenantAdmin.findById(req.params.id);

    if (!admin) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USER_NOT_FOUND
      );
    }

    const before = admin.toObject();

    const {
      name,
      email,
      phoneNumber,
      role,
      allowedCountries,
      status
    } = req.body;

    /**
     * ===============================
     * Email Validation
     * ===============================
     */

    if (email && email !== admin.email) {

      const exists = await TenantAdmin.findOne({
        email: email.toLowerCase(),
        tenantId: admin.tenantId
      });

      if (exists) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.USER_EMAIL_EXISTS,
          CODES.USER_EMAIL_EXISTS
        );
      }

      admin.email = email.toLowerCase();
    }

    /**
     * ===============================
     * Role Validation
     * ===============================
     */

    if (role) {

      const roleExists = await TenantRole.findOne({
        _id: role,
        tenantId: admin.tenantId
      });

      if (!roleExists) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.USER_INVALID_ROLE,
          CODES.USER_INVALID_ROLE
        );
      }

      admin.role = role;
    }

    /**
     * ===============================
     * Update Fields
     * ===============================
     */

    if (name) admin.name = name;

    if (phoneNumber) admin.phoneNumber = phoneNumber;

    if (status) admin.status = status.toUpperCase();

    if (allowedCountries) {
      admin.allowedCountries = allowedCountries.map(c => c.toUpperCase());
    }

    await admin.save();

    /**
     * ===============================
     * Populate Role
     * ===============================
     */

    const populatedAdmin = await admin.populate("role", "name");

    /**
     * ===============================
     * Audit Log
     * ===============================
     */

    await auditLogger?.({
      req,
      user: req.user,
      action: "UPDATE_TENANT_ADMIN",
      module: "TENANT_ADMINS",
      entityId: admin._id,
      entityName: admin.email,
      before,
      after: admin,
      message: req.t(MSG.USER_UPDATED)
    });

    /**
     * ===============================
     * Response
     * ===============================
     */

    return responseFormatter.success(
      req,
      res,
      MSG.USER_UPDATED,
      localizeTenantAdmin(populatedAdmin, lang),
      null,
      201
    );

  } catch (err) {

    console.error("Update Tenant Admin Error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_UPDATE_FAILED,
      CODES.USER_UPDATE_FAILED
    );
  }
};
/**
 * ============================================================
 * CHANGE TENANT ADMIN STATUS
 * ============================================================
 */
exports.changeTenantAdminStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const admin = await TenantAdmin.findById(id);

    if (!admin) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USER_NOT_FOUND
      );
    }

    const before = admin.toObject();

    /**
     * ===============================
     * Update Status
     * ===============================
     */

    if (status) {
      admin.status = status.toUpperCase();
    }

    await admin.save();

    /**
     * ===============================
     * Audit Log
     * ===============================
     */

    await auditLogger?.({
      req,
      user: req.user,
      action: "TENANT_ADMIN_STATUS_UPDATED",
      module: "TENANT_ADMINS",
      entityId: admin._id,
      entityName: admin.email,
      before,
      after: admin,
      message: req.t(MSG.USER_UPDATED)
    });

    /**
     * ===============================
     * Response
     * ===============================
     */

    return responseFormatter.success(
      req,
      res,
      MSG.USER_UPDATED,
      admin,
      null,
      200
    );

  } catch (err) {

    console.error("Change Tenant Admin Status Error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_UPDATE_FAILED,
      CODES.USER_UPDATE_FAILED
    );
  }
};

/**
 * ============================================================
 * DELETE TENANT ADMIN
 * ============================================================
 */
exports.deleteTenantAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await TenantAdmin.findByIdAndDelete(id);

    if (!admin) {
      return res
        .status(404)
        .json(error(MSG.NOT_FOUND, CODES.NOT_FOUND));
    }

    auditLogger(req, "TENANT_ADMIN_DELETED", admin);

    return res.json(success(MSG.DELETED));
  } catch (err) {
    return res
      .status(500)
      .json(error(MSG.SERVER_ERROR, CODES.SERVER_ERROR, err.message));
  }
};