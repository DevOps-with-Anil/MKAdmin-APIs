const Tenant = require("../../models/tenants/Tenant");
const TenantSubscription = require("../../models/subscriptions/TenantSubscription");
const Plan = require("../../models/subscriptions/Plan");

const { success, error } = require("../../utils/responseFormatter");
const auditLogger = require("../../utils/auditLogger");

const { SUPPORTED_LANGS, DEFAULT_LANG } = require("../../utils/i18n");

const MSG = require('../../config/constants/messageKeys');

/**
 * ============================================================
 * 🌍 Localize Subscription
 * ============================================================
 */
function localizeSubscription(subscription, lang = "en") {
  if (!subscription) return null;

  const obj = subscription.toObject ? subscription.toObject() : subscription;

  if (Array.isArray(obj.modules)) {
    obj.modules = obj.modules.map((module) => {
      module.moduleName = module.moduleName?.[lang] || module.moduleName?.[DEFAULT_LANG] || "";

      if (Array.isArray(module.actions)) {
        module.actions = module.actions.map((action) => {
          action.actionName = action.actionName?.[lang] || action.actionName?.[DEFAULT_LANG] || "";
          return action;
        });
      }

      return module;
    });
  }

  return obj;
}

/**
 * =====================================================
 * ASSIGN PLAN
 * =====================================================
 */
exports.assignPlan = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { tenantId, planId } = req.body;

    if (!tenantId || !planId) {
      return error(req, res, 400, MSG.REQUIRED_FIELDS_MISSING);
    }

    const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });
    if (!tenant) return error(req, res, 404, MSG.TENANT_NOT_FOUND);

    const existing = await TenantSubscription.findOne({ tenantId, status: "ACTIVE" });
    if (existing) return error(req, res, 400, MSG.ACTIVE_SUBSCRIPTION_EXISTS);

    const plan = await Plan.findById(planId);
    if (!plan) return error(req, res, 404, MSG.PLAN_NOT_FOUND);
    if (plan.status !== "ACTIVE") return error(req, res, 400, MSG.PLAN_NOT_ACTIVE);

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (plan.durationDays || 30));

    const modules = plan.modules.map((module) => ({
      moduleKey: module.moduleKey,
      moduleName: module.moduleName,
      actions: module.actions.map((action) => ({
        actionKey: action.actionKey,
        actionName: action.actionName,
        allowed: action.allowed
      }))
    }));

    const subscription = await TenantSubscription.create({
      tenantId,
      planId,
      startDate,
      expiryDate,
      modules,
      status: "ACTIVE"
    });

    tenant.currentSubscriptionId = subscription._id;
    await tenant.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: "TENANT_PLAN_ASSIGNED",
      module: "TENANTS",
      entityId: tenant._id,
      entityName: tenant.companyName?.en || tenant.contact_email
    });

    const localized = localizeSubscription(subscription, lang);
    return success(req, res, MSG.SUBSCRIPTION_ASSIGNED, localized, "", 201);

  } catch (err) {
    console.error("assignPlan error:", err);
    return error(req, res, 500, MSG.SUBSCRIPTION_ASSIGN_FAILED);
  }
};

/**
 * =====================================================
 * UPDATE PLAN (UPGRADE / DOWNGRADE)
 * =====================================================
 */
exports.updatePlan = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { tenantId, newPlanId } = req.body;

    if (!tenantId || !newPlanId) {
      return error(req, res, 400, MSG.REQUIRED_FIELDS_MISSING);
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return error(req, res, 404, MSG.TENANT_NOT_FOUND);

    const currentSubscription = await TenantSubscription.findOne({ tenantId, status: "ACTIVE" });
    if (!currentSubscription) return error(req, res, 404, MSG.SUBSCRIPTION_NOT_FOUND);

    const plan = await Plan.findById(newPlanId);
    if (!plan) return error(req, res, 404, MSG.PLAN_NOT_FOUND);
    if (plan.status !== "ACTIVE") return error(req, res, 400, MSG.PLAN_NOT_ACTIVE);

    currentSubscription.status = "CANCELLED";
    currentSubscription.cancelledAt = new Date();
    await currentSubscription.save();

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (plan.durationDays || 30));

    const modules = plan.modules.map((module) => ({
      moduleKey: module.moduleKey,
      moduleName: module.moduleName,
      actions: module.actions.map((action) => ({
        actionKey: action.actionKey,
        actionName: action.actionName,
        allowed: action.allowed
      }))
    }));

    const newSubscription = await TenantSubscription.create({
      tenantId,
      planId: newPlanId,
      startDate,
      expiryDate,
      modules,
      status: "ACTIVE"
    });

    tenant.currentSubscriptionId = newSubscription._id;
    await tenant.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: "TENANT_PLAN_UPDATED",
      module: "TENANTS",
      entityId: tenant._id,
      entityName: tenant.companyName?.en || tenant.contact_email
    });

    const localized = localizeSubscription(newSubscription, lang);
    return success(req, res, MSG.SUBSCRIPTION_UPDATED, localized);

  } catch (err) {
    console.error("updatePlan error:", err);
    return error(req, res, 500, MSG.SUBSCRIPTION_UPDATE_FAILED);
  }
};

/**
 * =====================================================
 * GET ACTIVE SUBSCRIPTION
 * =====================================================
 */
exports.getActiveSubscription = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { tenantId } = req.params;

    const subscription = await TenantSubscription.findOne({ tenantId, status: "ACTIVE" })
      .populate("planId", "planName price");

    if (!subscription) return error(req, res, 404, MSG.SUBSCRIPTION_NOT_FOUND);

    const localized = localizeSubscription(subscription, lang);
    return success(req, res, MSG.SUBSCRIPTION_ACTIVE_FETCHED, localized, "", 201);

  } catch (err) {
    console.error("getActiveSubscription error:", err);
    return error(req, res, 500, MSG.SUBSCRIPTION_NOT_FOUND);
  }
};

/**
 * =====================================================
 * CANCEL SUBSCRIPTION
 * =====================================================
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) return error(req, res, 400, MSG.REQUIRED_FIELDS_MISSING);

    const subscription = await TenantSubscription.findOne({ tenantId, status: "ACTIVE" });
    if (!subscription) return error(req, res, 404, MSG.SUBSCRIPTION_NOT_FOUND);

    subscription.status = "CANCELLED";
    subscription.cancelledAt = new Date();
    await subscription.save();

    await Tenant.findByIdAndUpdate(tenantId, {
      subscriptionStatus: "CANCELLED",
      currentSubscriptionId: null
    });

    await auditLogger?.({
      req,
      user: req.user,
      action: "TENANT_SUBSCRIPTION_CANCELLED",
      module: "TENANTS",
      entityId: tenantId
    });

    return success(req, res, MSG.SUBSCRIPTION_CANCELLED, "", "", 201);

  } catch (err) {
    console.error("cancelSubscription error:", err);
    return error(req, res, 500, MSG.SUBSCRIPTION_CANCEL_FAILED);
  }
};

/**
 * =====================================================
 * GET TENANT SUBSCRIPTION HISTORY
 * =====================================================
 */
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { tenantId } = req.params;
    const { page = 1, limit = 10, search } = req.body;

    const skip = (page - 1) * limit;

    const query = { tenantId };
    if (search) {
      query.$or = [
        { "planId.planName.en": { $regex: search, $options: "i" } }
      ];
    }

    const total = await TenantSubscription.countDocuments(query);

    const subscriptions = await TenantSubscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("planId", "planName price");

    const localizedSubscriptions = subscriptions.map((sub) => localizeSubscription(sub, lang));

    const meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };

    return success(req, res, MSG.SUBSCRIPTION_HISTORY_FETCHED, localizedSubscriptions, meta, 201);

  } catch (err) {
    console.error("getSubscriptionHistory error:", err);
    return error(req, res, 500, MSG.SUBSCRIPTION_HISTORY_FAILED);
  }
};