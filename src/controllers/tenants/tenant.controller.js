
const User = require("../../models/rbac/RootAdmin");
const Tenant = require('../../models/tenants/Tenant');
const TenantSubscription = require('../../models/subscriptions/TenantSubscription');
const Plan = require('../../models/subscriptions/Plan');
const TenantRole = require("../../models/affiliates/rbac/TenantRole");
const TenantAdmin = require("../../models/affiliates/rbac/TenantAdmin");

const MSG = require('../../config/constants/messageKeys');
const CODES = require('../../config/constants/errorCodes');
const responseFormatter = require("../../utils/responseFormatter");
const auditLogger = require('../../utils/auditLogger');
const { SUPPORTED_LANGS, DEFAULT_LANG } = require('../../utils/i18n');
const path = require("path");
const fs = require("fs");

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

  if (obj.currentSubscriptionId) {
    obj.currentSubscriptionId.planName =
      obj.currentSubscriptionId.planName?.[lang] ||
      obj.currentSubscriptionId.planName?.[DEFAULT_LANG] ||
      "";
  }

  return obj;
}


// ============================================================
// CREATE TENANT
// ============================================================
exports.createTenant = async (req, res) => {

  try {

    const user = req.user;

    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const {
      contact,
      platform,
      companyName,
      description,
      address,
      apiDomains,
      logo,
      admin
    } = req.body;

    /* =======================================
       NORMALIZATION
    ======================================= */

    const normalizedEmail =
      contact?.email?.toLowerCase()?.trim();

    const normalizedAdminEmail =
      admin?.email?.toLowerCase()?.trim();

    const normalizedAdminPanelUrl =
      platform?.adminPanelUrl?.trim();

    /* =======================================
       REQUIRED VALIDATION
    ======================================= */

    if (
      !normalizedEmail ||
      !normalizedAdminPanelUrl
    ) {

      return responseFormatter.error(
        req,
        res,
        400,
        "Email and Admin Panel URL are required",
        "REQUIRED_FIELDS_MISSING"
      );
    }

    if (
      !admin?.name ||
      !normalizedAdminEmail ||
      !admin?.password
    ) {

      return responseFormatter.error(
        req,
        res,
        400,
        "Admin credentials are required",
        "ADMIN_REQUIRED"
      );
    }

    if (admin.password.length < 8) {

      return responseFormatter.error(
        req,
        res,
        400,
        "Password must be minimum 8 characters",
        "INVALID_PASSWORD"
      );
    }

    /* =======================================
       CHECK EXISTING TENANT EMAIL
    ======================================= */

    const existingTenant =
      await Tenant.findOne({
        "contact.email": normalizedEmail,
        isDeleted: false
      });

    if (existingTenant) {

      return responseFormatter.error(
        req,
        res,
        409,
        "Tenant already exists with this email",
        "TENANT_ALREADY_EXISTS"
      );
    }

    /* =======================================
       CHECK EXISTING ADMIN PANEL URL
    ======================================= */

    const existingAdminPanelUrl =
      await Tenant.findOne({
        "platform.adminPanelUrl":
          normalizedAdminPanelUrl,
        isDeleted: false
      });

    if (existingAdminPanelUrl) {

      return responseFormatter.error(
        req,
        res,
        409,
        "Admin panel URL already exists",
        "ADMIN_PANEL_URL_EXISTS"
      );
    }

    /* =======================================
       CHECK EXISTING ADMIN EMAIL
    ======================================= */

    const existingAdmin =
      await TenantAdmin.findOne({
        email: normalizedAdminEmail,
        status: {
          $in: ["ACTIVE", "INACTIVE"]
        }
      }).populate("role");

    if (
      existingAdmin &&
      existingAdmin.role &&
      existingAdmin.role.isSystem
    ) {

      return responseFormatter.error(
        req,
        res,
        409,
        "Admin email already exists",
        "ADMIN_ALREADY_EXISTS"
      );
    }

    /* =======================================
       MULTILANG NORMALIZATION
    ======================================= */

    const normalizedCompanyName = {};
    const normalizedDescription = {};

    for (const langKey of SUPPORTED_LANGS) {

      normalizedCompanyName[langKey] =
        companyName?.[langKey]?.trim() || "";

      normalizedDescription[langKey] =
        description?.[langKey]?.trim() || "";
    }

    /* =======================================
       CREATE TENANT
    ======================================= */

    const tenantPayload = {

      contact: {
        email: normalizedEmail,
        phone: {
          code:
            contact?.phone?.code || null,

          number:
            contact?.phone?.number || null
        }
      },

      platform: {
        website:
          platform?.website?.trim() || null,

        adminPanelUrl:
          normalizedAdminPanelUrl
      },

      logo: logo || null,

      companyName:
        normalizedCompanyName,

      description:
        normalizedDescription,

      address: address || {},

      apiDomains: Array.isArray(apiDomains)
        ? apiDomains.map((d) => d.trim())
        : [],

      currentSubscriptionId: null,

      createdBy: user._id
    };

    const tenant =
      await Tenant.create(
        tenantPayload
      );

    /* =======================================
       CREATE SYSTEM ROLE
    ======================================= */

    const systemRole =
      await TenantRole.create({

        tenantId: tenant._id,

        name: {
          en: "Super Admin",
          fr: "Super Administrateur"
        },

        description: {
          en: "Full access system role",
          fr: "Rôle système avec accès complet"
        },

        permissions: [],

        createdByType: "ROOT",

        createdBy: user._id,

        isSystem: true,

        status: "ACTIVE"
      });

    /* =======================================
       CREATE TENANT ADMIN
    ======================================= */

    const tenantAdmin =
      await TenantAdmin.create({

        tenantId: tenant._id,

        name: admin.name.trim(),

        email: normalizedAdminEmail,

        phoneCode:
          admin?.phoneCode || null,

        phoneNumber:
          admin?.phoneNumber || null,

        password: admin.password,

        role: systemRole._id,

        userType: "TENANT",

        status: "ACTIVE",

        createdByType: "ROOT",

        createdBy: user._id
      });

    /* =======================================
       AUDIT LOG
    ======================================= */

    await auditLogger?.({

      req,

      user,

      action: "TENANT_CREATE",

      module: "TENANTS",

      entityId: tenant._id,

      entityName:
        tenant.companyName?.en ||
        tenant.contact?.email,

      after: {
        tenant,
        role: systemRole,
        admin: tenantAdmin
      },

      message: req.t(
        MSG.TENANT_CREATED
      )
    });

    /* =======================================
       RESPONSE
    ======================================= */

    return responseFormatter.success(
      req,
      res,
      MSG.TENANT_CREATED,
      {
        tenant: localizeTenant(
          tenant,
          lang
        ),

        admin: tenantAdmin
      },
      null,
      201
    );

  } catch (err) {

    console.error(
      "Create Tenant Error:",
      err
    );

    /* =======================================
       DUPLICATE KEY HANDLING
    ======================================= */

    if (err.code === 11000) {

      if (
        err.keyPattern?.["contact.email"]
      ) {

        return responseFormatter.error(
          req,
          res,
          409,
          "Tenant email already exists",
          "TENANT_ALREADY_EXISTS"
        );
      }

      if (
        err.keyPattern?.[
        "platform.adminPanelUrl"
        ]
      ) {

        return responseFormatter.error(
          req,
          res,
          409,
          "Admin panel URL already exists",
          "ADMIN_PANEL_URL_EXISTS"
        );
      }

      if (err.keyPattern?.email) {

        return responseFormatter.error(
          req,
          res,
          409,
          "Admin email already exists",
          "ADMIN_ALREADY_EXISTS"
        );
      }
    }

    /* =======================================
       SERVER ERROR
    ======================================= */

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
    const user = req.user;
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const tenant = await Tenant.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate({
      path: "currentSubscriptionId",
      select: "planId startDate expiryDate status",
      populate: {
        path: "planId",
        select: "name"
      }
    });

    if (!tenant) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.TENANT_NOT_FOUND,
        CODES.USR_404
      );
    }

    const admin = await TenantAdmin.findOne({
      tenantId: tenant._id
    })
      .populate({
        path: "role",
        match: { isSystem: true },
        select: "name code"
      })
      .select("-tokens -password")
      .lean();

    /* ================= LOCALIZE TENANT ================= */

    const localizedTenant = localizeTenant(tenant, lang);

    /* ================= FORMAT ADMIN ================= */

    if (admin?.role?.name) {
      admin.role.name =
        admin.role.name?.[lang] ||
        admin.role.name?.[DEFAULT_LANG] ||
        "";
    }

    localizedTenant.admin = admin || null;

    /* ================= FORMAT SUBSCRIPTION ================= */

    const subscription = localizedTenant.currentSubscriptionId;
    const plan = tenant?.currentSubscriptionId?.planId;

    if (subscription) {
      subscription.planName =
        plan?.name?.[lang] ||
        plan?.name?.[DEFAULT_LANG] ||
        "";

      subscription.planId = plan?._id || null;
    }

    /* ================= AUDIT LOG ================= */

    await auditLogger?.({
      req,
      user,
      action: "TENANT_VIEW",
      module: "TENANTS",
      entityId: tenant._id,
      entityName:
        localizedTenant.companyName || tenant.contact_email,
      after: localizedTenant,
      message: req.t(MSG.TENANT_FETCHED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.TENANT_FETCHED,
      localizedTenant,
      null,
      200
    );
  } catch (err) {
    console.error("getTenantById error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.TENANT_FETCH_FAILED,
      CODES.USR_500
    );
  }
};


// ============================================================
// GET TENANT BY ID
// ============================================================
exports.getTenantByIdtoEdit = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false })
      .populate({ path: "currentSubscriptionId", select: "planId planName startDate expiryDate status" });

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

    const user = req.user;
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    // ============================================================
    // FIND TENANT
    // ============================================================
    const tenant = await Tenant.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!tenant) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.TENANT_NOT_FOUND,
        CODES.USR_404
      );
    }

    const payload = req.body;

    // ============================================================
    // CONTACT EMAIL VALIDATION
    // ============================================================
    if (payload.contact?.email) {
      const normalizedEmail = payload.contact.email
        .toLowerCase()
        .trim();

      const existingTenant = await Tenant.findOne({
        "contact.email": normalizedEmail,
        _id: { $ne: tenant._id },
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

      if (!tenant.contact) {
        tenant.contact = {};
      }

      tenant.contact.email = normalizedEmail;
    }

    // ============================================================
    // CONTACT UPDATE
    // ============================================================
    if (payload.contact) {
      tenant.contact = {
        ...(tenant.contact?.toObject?.() || {}),
        ...payload.contact,
        phone: {
          ...(tenant.contact?.phone?.toObject?.() || {}),
          ...(payload.contact.phone || {})
        }
      };
    }

    // ============================================================
    // COMPANY NAME (MULTILINGUAL)
    // ============================================================
    if (payload.companyName) {
      const normalizedCompanyName = {
        ...(tenant.companyName?.toObject?.() || {})
      };

      for (const langKey of SUPPORTED_LANGS) {
        if (payload.companyName?.[langKey] !== undefined) {
          normalizedCompanyName[langKey] =
            payload.companyName[langKey]?.trim() || "";
        }
      }

      tenant.companyName = normalizedCompanyName;
    }

    // ============================================================
    // DESCRIPTION (MULTILINGUAL)
    // ============================================================
    if (payload.description) {
      const normalizedDescription = {
        ...(tenant.description?.toObject?.() || {})
      };

      for (const langKey of SUPPORTED_LANGS) {
        if (payload.description?.[langKey] !== undefined) {
          normalizedDescription[langKey] =
            payload.description[langKey]?.trim() || "";
        }
      }

      tenant.description = normalizedDescription;
    }

    // ============================================================
    // PLATFORM UPDATE
    // ============================================================
    if (payload.platform) {
      tenant.platform = {
        ...(tenant.platform?.toObject?.() || {}),
        ...payload.platform
      };
    }

    // ============================================================
    // API DOMAINS
    // ============================================================
    if (Array.isArray(payload.apiDomains)) {
      tenant.apiDomains = payload.apiDomains;
    }

    // ============================================================
    // ADDRESS UPDATE
    // ============================================================
    if (payload.address) {
      tenant.address = {
        ...(tenant.address?.toObject?.() || {}),
        ...payload.address
      };
    }

    // ============================================================
    // OPTIONAL STATUS UPDATE
    // ============================================================
    if (payload.status) {
      tenant.status = payload.status;
    }

    // ============================================================
    // OPTIONAL KYB STATUS UPDATE
    // ============================================================
    if (payload.kybStatus) {
      tenant.kybStatus = payload.kybStatus;
    }

    // ============================================================
    // SAVE
    // ============================================================
    await tenant.save();

    // ============================================================
    // LOCALIZE RESPONSE
    // ============================================================
    const localizedTenant = localizeTenant(tenant, lang);

    // ============================================================
    // AUDIT LOG
    // ============================================================
    await auditLogger?.({
      req,
      user,
      action: "TENANT_UPDATE",
      module: "TENANTS",
      entityId: tenant._id,
      entityName:
        localizedTenant.companyName ||
        tenant.contact?.email,
      after: localizedTenant,
      message: req.t(MSG.TENANT_UPDATED)
    });

    // ============================================================
    // SUCCESS RESPONSE
    // ============================================================
    return responseFormatter.success(
      req,
      res,
      MSG.TENANT_UPDATED,
      localizedTenant,
      null,
      201
    );

  } catch (err) {
    console.error("updateTenant error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.TENANT_UPDATE_FAILED,
      CODES.USR_500
    );
  }
};


// ============================================================
// UPDATE TENANT
// ============================================================
exports.updateTenantLogo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return;
    const file = req.file;

    const lang = req.lang || DEFAULT_LANG;

    // ============================================================
    // FIND TENANT
    // ============================================================
    const tenant = await Tenant.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!tenant) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.TENANT_NOT_FOUND,
        CODES.USR_404
      );
    }

    const before = { ...tenant.toObject() };

    /**
     * =========================================
     * Handle logo upload
     * =========================================
     */
    if (file) {
      /**
       * Delete old logo
       */
      if (tenant.logo) {
        try {
          const oldPath = tenant.logo.split(req.get("host"))[1];

          if (oldPath) {
            const fullPath = path.join(process.cwd(), oldPath);

            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } catch (err) {
          console.error("Old logo delete failed:", err);
        }
      }

      /**
       * Save new logo URL
       */
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const logoUrl = `${baseUrl}/${file.path.replace(/\\/g, "/")}`;

      tenant.logo = logoUrl;
    }

    await tenant.save();

    const after = { ...tenant.toObject() };

    /**
     * =========================================
     * Audit log
     * =========================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "UPDATE_TENANT_LOGO",
      module: "TENANT",
      entityId: tenant._id,
      entityName: tenant.companyName,
      before,
      after,
      message: "Tenant logo updated"
    });

    /**
     * =========================================
     * Response
     * =========================================
     */
    return responseFormatter.success(
      req,
      res,
      MSG.TENANT_LOGO_UPDATED,
      {
        id: tenant._id,
        companyName: tenant.companyName,
        logo: tenant.logo
      },
      {},
      200
    );
  } catch (error) {
    console.error("Update tenant logo error:", error);

    return responseFormatter.error(
      req,
      res,
      500,
      "SERVER_ERROR",
      "Something went wrong"
    );
  }
};

// ============================================================
// SOFT DELETE TENANT
// ============================================================
exports.softDeleteTenant = async (req, res) => {
  try {
    const user = req.user;
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
    const user = req.user;
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const {
      page = 1,
      limit = 20,
      search = "",
      status = ""
    } = req.query;

    /* ================= QUERY ================= */

    const query = {
      isDeleted: false
    };

    if (search) {
      query["companyName.en"] = {
        $regex: search,
        $options: "i"
      };
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    /* ================= FETCH ================= */

    const [tenants, total] = await Promise.all([
      Tenant.find(query)
        .populate({
          path: "currentSubscriptionId",
          select: "planId startDate expiryDate status",
          populate: {
            path: "planId",
            select: "name"
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Tenant.countDocuments(query)
    ]);

    /* ================= LOCALIZE ================= */

    const localizedTenants = tenants.map((tenant) => {
      const localizedTenant =
        localizeTenant(tenant, lang);

      const subscription =
        localizedTenant.currentSubscriptionId;

      const plan =
        tenant?.currentSubscriptionId?.planId;

      if (subscription) {
        subscription.planName =
          plan?.name?.[lang] ||
          plan?.name?.[DEFAULT_LANG] ||
          "";

        subscription.planId =
          plan?._id || null;
      }

      return localizedTenant;
    });

    /* ================= META ================= */

    const meta = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(
        total / Number(limit)
      )
    };

    return responseFormatter.success(
      req,
      res,
      MSG.TENANT_LIST_FETCHED,
      localizedTenants,
      meta,
      200
    );
  } catch (err) {
    console.error("listTenants error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.TENANT_LIST_FETCH_FAILED,
      CODES.USR_500
    );
  }
};

// ============================================================
// ASSIGN PLAN TO TENANT
// ============================================================
exports.assignPlanToTenant = async (req, res) => {
  try {
    const user = req.user;
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
      planName: plan.name,
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