
const User = require("../../models/rbac/RootAdmin");
const Tenant = require('../../models/tenants/Tenant');
const TenantSubscription = require('../../models/subscriptions/TenantSubscription');
const Plan = require('../../models/subscriptions/Plan');

const MSG = require('../../config/constants/messageKeys');
const CODES = require('../../config/constants/errorCodes');
const responseFormatter = require("../../utils/responseFormatter");
const auditLogger = require('../../utils/auditLogger');
const { SUPPORTED_LANGS, DEFAULT_LANG } = require('../../utils/i18n');

// ============================================================
// 🌍 Localize Tenant
// ============================================================
function localizeTenant(tenant, lang = DEFAULT_LANG) {
  if (!tenant) return null;

  const obj = tenant.toObject ? tenant.toObject() : tenant;

  obj.companyName =
    obj.companyName?.[lang] || obj.companyName?.[DEFAULT_LANG] || "";
  obj.description =
    obj.description?.[lang] || obj.description?.[DEFAULT_LANG] || "";

  return obj;
}

// ============================================================
// Helper to fetch user globally
// ============================================================
async function validateUser(req, res) {
  if (!req.user?._id) {
    responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_INVALID, CODES.USR_401);
    return null;
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);
    return null;
  }

  return user;
}

// ============================================================
// CREATE TENANT
// ============================================================
exports.createTenant = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const {
      contact,
      platform,
      companyName,
      description,
      address,
      apiDomains,
      logo
    } = req.body;

    /* ================= REQUIRED VALIDATION ================= */

    if (!contact?.email || !platform?.adminPanelUrl) {
      return responseFormatter.error(
        req,
        res,
        400,
        "Email and Admin Panel URL are required",
        "REQUIRED_FIELDS_MISSING"
      );
    }

    /* ================= NORMALIZATION ================= */

    const normalizedEmail = contact.email.toLowerCase().trim();

    /* ================= DUPLICATE CHECK ================= */

    const existingTenant = await Tenant.findOne({
      "contact.email": normalizedEmail,
      isDeleted: false
    });

    if (existingTenant) {
      return responseFormatter.error(
        req,
        res,
        409,
        MSG.TENANT_ALREADY_EXISTS,
        CODES.USR_409
      );
    }

    /* ================= MULTILANG NORMALIZATION ================= */

    const normalizedCompanyName = {};
    const normalizedDescription = {};

    for (const langKey of SUPPORTED_LANGS) {
      normalizedCompanyName[langKey] =
        companyName?.[langKey]?.trim() || "";

      normalizedDescription[langKey] =
        description?.[langKey]?.trim() || "";
    }

    /* ================= CLEAN DATA ================= */

    const tenantPayload = {
      contact: {
        email: normalizedEmail,
        phone: {
          code: contact?.phone?.code || null,
          number: contact?.phone?.number || null
        }
      },

      platform: {
        website: platform?.website?.trim() || null,
        adminPanelUrl: platform.adminPanelUrl.trim()
      },

      logo: logo || null,

      companyName: normalizedCompanyName,
      description: normalizedDescription,

      address: address || {},

      apiDomains: Array.isArray(apiDomains)
        ? apiDomains.map(d => d.trim())
        : [],

      kybStatus: "PENDING",
      currentSubscriptionId: null,
      status: "ACTIVE",

      createdBy: user._id
    };

    /* ================= CREATE ================= */

    const tenant = await Tenant.create(tenantPayload);

    /* ================= AUDIT ================= */

    await auditLogger?.({
      req,
      user,
      action: "TENANT_CREATE",
      module: "TENANTS",
      entityId: tenant._id,
      entityName:
        tenant.companyName?.en || tenant.contact?.email,
      after: tenant,
      message: req.t(MSG.TENANT_CREATED)
    });

    /* ================= RESPONSE ================= */

    return responseFormatter.success(
      req,
      res,
      MSG.TENANT_CREATED,
      localizeTenant(tenant, lang),
      null,
      201
    );

  } catch (err) {
    console.error("Create Tenant Error:", err);

    if (err.code === 11000) {
      return responseFormatter.error(
        req,
        res,
        409,
        MSG.TENANT_ALREADY_EXISTS,
        CODES.USR_409
      );
    }

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.TENANT_CREATE_FAILED,
      CODES.USR_500
    );
  }
};

// ============================================================
// GET TENANT BY ID
// ============================================================
exports.getTenantById = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false })
      .populate({ path: "currentSubscriptionId", select: "planId startDate expiryDate status" });

    if (!tenant) {
      return responseFormatter.error(req, res, 404, MSG.TENANT_NOT_FOUND, CODES.USR_404);
    }

    const localizedTenant = localizeTenant(tenant, lang);

    await auditLogger?.({
      req,
      user,
      action: "TENANT_VIEW",
      module: "TENANTS",
      entityId: tenant._id,
      entityName: localizedTenant.companyName || tenant.contact_email,
      after: localizedTenant,
      message: req.t(MSG.TENANT_FETCHED)
    });

    return responseFormatter.success(req, res, MSG.TENANT_FETCHED, tenant, null, 200);

  } catch (err) {
    console.error("getTenantById error:", err);
    return responseFormatter.error(req, res, 500, MSG.TENANT_FETCH_FAILED, CODES.USR_500);
  }
};

// ============================================================
// UPDATE TENANT
// ============================================================
exports.updateTenant = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false });
    if (!tenant) return responseFormatter.error(req, res, 404, MSG.TENANT_NOT_FOUND, CODES.USR_404);

    const payload = req.body;

    if (payload.contact_email) {
      const normalizedEmail = payload.contact_email.toLowerCase().trim();
      const existing = await Tenant.findOne({ contact_email: normalizedEmail, _id: { $ne: tenant._id }, isDeleted: false });
      if (existing) return responseFormatter.error(req, res, 409, MSG.TENANT_ALREADY_EXISTS, CODES.USR_409);

      tenant.contact_email = normalizedEmail;
    }

    if (payload.phoneCode) tenant.phoneCode = payload.phoneCode;
    if (payload.contact_phoneNumber) tenant.contact_phoneNumber = payload.contact_phoneNumber;
    if (payload.logo) tenant.logo = payload.logo;
    if (payload.address) tenant.address = { ...tenant.address?.toObject?.(), ...payload.address };

    // Multilingual fields
    const normalizedCompanyName = {};
    const normalizedDescription = {};
    for (const langKey of SUPPORTED_LANGS) {
      normalizedCompanyName[langKey] = payload.companyName?.[langKey]?.trim() || "";
      normalizedDescription[langKey] = payload.description?.[langKey]?.trim() || "";
    }
    tenant.companyName = normalizedCompanyName;
    tenant.description = normalizedDescription;

    if (payload.website) tenant.website = payload.website;
    if (payload.adminPanelUrl) tenant.adminPanelUrl = payload.adminPanelUrl;
    if (Array.isArray(payload.apiDomains)) tenant.apiDomains = payload.apiDomains;

    await tenant.save();

    const localizedTenant = localizeTenant(tenant, lang);

    await auditLogger?.({
      req,
      user,
      action: "TENANT_UPDATE",
      module: "TENANTS",
      entityId: tenant._id,
      entityName: localizedTenant.companyName || tenant.contact_email,
      after: localizedTenant,
      message: req.t(MSG.TENANT_UPDATED)
    });

    return responseFormatter.success(req, res, MSG.TENANT_UPDATED, localizedTenant, null, 201);

  } catch (err) {
    console.error("updateTenant error:", err);
    return responseFormatter.error(req, res, 500, MSG.TENANT_UPDATE_FAILED, CODES.USR_500);
  }
};

// ============================================================
// SOFT DELETE TENANT
// ============================================================
exports.softDeleteTenant = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false });
    if (!tenant) return responseFormatter.error(req, res, 404, MSG.TENANT_NOT_FOUND, CODES.USR_404);

    tenant.isDeleted = true;
    tenant.deletedAt = new Date();

    await tenant.save();

    await auditLogger?.({
      req,
      user,
      action: "TENANT_DELETE",
      module: "TENANTS",
      entityId: tenant._id,
      entityName: tenant.companyName?.en || tenant.contact_email,
      message: req.t(MSG.TENANT_SOFT_DELETED)
    });

    return responseFormatter.success(req, res, MSG.TENANT_SOFT_DELETED, null, null, 200);

  } catch (err) {
    console.error("softDeleteTenant error:", err);
    return responseFormatter.error(req, res, 500, MSG.TENANT_DELETE_FAILED, CODES.USR_500);
  }
};

// ============================================================
// LIST TENANTS
// ============================================================
exports.listTenants = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;
    const { page = 1, limit = 20, search = "", status = "" } = req.query;

    const query = { isDeleted: false };
    if (search) query["companyName.en"] = { $regex: search, $options: "i" };
    if (status) query.status = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [tenants, total] = await Promise.all([
      Tenant.find(query)
        .populate({ path: "currentSubscriptionId", select: "planId startDate expiryDate status" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Tenant.countDocuments(query)
    ]);

    const localizedTenants = tenants.map(t => localizeTenant(t, lang));
    const meta = { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) };

    return responseFormatter.success(req, res, MSG.TENANT_LIST_FETCHED, localizedTenants, meta, 200);

  } catch (err) {
    console.error("listTenants error:", err);
    return responseFormatter.error(req, res, 500, MSG.TENANT_LIST_FETCH_FAILED, CODES.USR_500);
  }
};

// ============================================================
// ASSIGN PLAN TO TENANT
// ============================================================
exports.assignPlanToTenant = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const { tenantId, planId } = req.body;
    if (!planId) return responseFormatter.error(req, res, 400, MSG.PLAN_FETCH_FAILED);
    if (!tenantId) return responseFormatter.error(req, res, 400, MGS.TENANT_FETCH_FAILED);

    const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });
    if (!tenant) return responseFormatter.error(req, res, 404, MSG.TENANT_NOT_FOUND);

    const plan = await Plan.findById(planId);
    if (!plan) return responseFormatter.error(req, res, 404, MSG.PLAN_NOT_FOUND);
    if (plan.status !== "ACTIVE") return responseFormatter.error(req, res, 400, MSG.PLAN_NOT_ACTIVE);

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (plan.durationDays || 30));

    const modules = plan.modules.map(module => ({
      moduleKey: module.moduleKey,
      moduleName: module.moduleName,
      actions: module.actions.map(action => ({
        actionKey: action.actionKey,
        actionName: action.actionName,
        allowed: action.allowed
      }))
    }));

    

    const subscription = await TenantSubscription.create({
      tenantId: tenant._id,
      planId: plan._id,
      startDate,
      expiryDate,
      modules,
      status: "ACTIVE"
    });

    tenant.currentSubscriptionId = subscription._id;
    await tenant.save();

    await auditLogger?.({
      req,
      user,
      action: "TENANT_PLAN_ASSIGNED",
      module: "TENANTS",
      entityId: tenant._id,
      entityName: tenant.companyName?.en || tenant.contact_email,
      message: `Plan ${plan.name?.en || plan._id} assigned`
    });

    return responseFormatter.success(req, res, "Plan assigned successfully", subscription, null, 200);

  } catch (err) {
    console.error("assignPlanToTenant error:", err);
    return responseFormatter.error(req, res, 500, "Failed to assign plan", CODES.USR_500);
  }
};