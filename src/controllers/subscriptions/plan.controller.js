const Plan = require('../../models/subscriptions/Plan');
const TenantModule = require('../../models/rbac/TenantModule');
const auditLogger = require('../../utils/auditLogger');
const responseFormatter = require('../../utils/responseFormatter');
const MSG = require('../../config/constants/messageKeys');
const CODES = require('../../config/constants/errorCodes');
const { SUPPORTED_LANGS, DEFAULT_LANG } = require('../../utils/i18n');

/**
 * Helper: Validate localized object dynamically
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
 * Helper: Localize plan output
 */
function localizePlan(plan, lang) {
  const obj = plan.toObject();

  obj.name = obj.name?.[lang] || obj.name?.[DEFAULT_LANG];
  obj.description = obj.description?.[lang] || obj.description?.[DEFAULT_LANG];

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
 * =========================================
 * CREATE PLAN
 * =========================================
 */
exports.createPlan = async (req, res) => {
  try {
    const { name, description, price = 0, currency = 'USD', duration = 'MONTHLY', modules = [] } = req.body;

    const validationError = validateLocalizedField(name, 'Plan name');
    if (validationError)
      return responseFormatter.error(req, res, 400, validationError);

    

     /**
     * Check if plan already exists (based on English name)
     */
    const existingPlan = await Plan.findOne({
      "name.en": name?.en
    });


    if (existingPlan) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.PLAN_ALREADY_EXISTS,
        CODES.PLAN_ALREADY_EXISTS
      );
    }

    const plan = await Plan.create({
      name,
      description,
      price,
      currency: currency.toUpperCase(),
      duration: duration.toUpperCase(),
      modules,
      createdBy: req.user._id
    });

    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_PLAN',
      module: 'PLANS',
      entityId: plan._id,
      entityName: plan.name?.[req.lang] || plan.name?.[DEFAULT_LANG],
      after: plan,
      message: req.t(MSG.PLAN_CREATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.PLAN_CREATED,
      localizePlan(plan, req.lang),
      null,
      201
    );
  } catch (err) {
    console.error('Create plan error:', err);
    return responseFormatter.error(req, res, 500, MSG.PLAN_CREATE_FAILED);
  }
};

/**
 * =========================================
 * LIST PLANS
 * =========================================
 */
exports.listPlans = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.body;

    const query = {};

    if (search) {
      query[`name.${req.lang}`] = { $regex: search, $options: 'i' };
    }

    // if (status) {
    //   query.status = status.toUpperCase();
    // }

    const skip = (Number(page) - 1) * Number(limit);

    const [plans, total] = await Promise.all([
      Plan.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Plan.countDocuments(query)
    ]);

    const localizedPlans = plans.map(plan =>
      localizePlan(plan, req.lang)
    );

    return responseFormatter.success(
      req,
      res,
      MSG.PLAN_LIST_FETCHED,
      localizedPlans,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      201
    );
  } catch (err) {
    console.error('List plans error:', err);
    return responseFormatter.error(req, res, 500, MSG.PLAN_LIST_FAILED);
  }
};

/**
 * =========================================
 * GET PLAN
 * =========================================
 */
exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan)
      return responseFormatter.error(req, res, 404, MSG.PLAN_NOT_FOUND);

    return responseFormatter.success(
      req,
      res,
      MSG.PLAN_FETCHED,
      localizePlan(plan, req.lang),
      null,
      200
    );
  } catch (err) {
    console.error('Get plan error:', err);
    return responseFormatter.error(req, res, 500, MSG.PLAN_FETCH_FAILED);
  }
};

/**
 * =========================================
 * UPDATE PLAN
 * =========================================
 */
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan)
      return responseFormatter.error(req, res, 404, MSG.PLAN_NOT_FOUND);

    const { name, description, price, currency, duration, status, modules } = req.body;
    const before = plan.toObject();

    if (name) {
      const validationError = validateLocalizedField(name, 'Plan name');
      if (validationError)
        return responseFormatter.error(req, res, 400, validationError);
      plan.name = name;
    }

    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (currency) plan.currency = currency.toUpperCase();
    if (duration) plan.duration = duration.toUpperCase();
    if (status) plan.status = status.toUpperCase();
    if (modules) plan.modules = modules;

    await plan.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_PLAN',
      module: 'PLANS',
      entityId: plan._id,
      entityName: plan.name?.[req.lang] || plan.name?.[DEFAULT_LANG],
      before,
      after: plan,
      message: req.t(MSG.PLAN_UPDATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.PLAN_UPDATED,
      localizePlan(plan, req.lang),
      null,
      201
    );
  } catch (err) {
    console.error('Update plan error:', err);
    return responseFormatter.error(req, res, 500, MSG.PLAN_UPDATE_FAILED);
  }
};

/**
 * =========================================
 * DELETE PLAN
 * =========================================
 */
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan)
      return responseFormatter.error(req, res, 404, MSG.PLAN_NOT_FOUND);

    const before = plan.toObject();

    await Plan.findByIdAndDelete(plan._id);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_PLAN',
      module: 'PLANS',
      entityId: plan._id,
      entityName: plan.name?.[req.lang] || plan.name?.[DEFAULT_LANG],
      before,
      after: null,
      message: req.t(MSG.PLAN_DELETED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.PLAN_DELETED,
      localizePlan(plan, req.lang),
      null,
      200
    );
  } catch (err) {
    console.error('Delete plan error:', err);
    return responseFormatter.error(req, res, 500, MSG.PLAN_DELETE_FAILED);
  }
};

/**
 * =========================================
 * ASSIGN MODULES
 * =========================================
 */
exports.assignModules = async (req, res) => {
  try {
    const { modules } = req.body;

    if (!Array.isArray(modules))
      return responseFormatter.error(req, res, 400, MSG.MODULES_ARRAY_REQUIRED);

    const plan = await Plan.findById(req.params.id);
    if (!plan)
      return responseFormatter.error(req, res, 404, MSG.PLAN_NOT_FOUND);

    const newModules = [];

    for (const mod of modules) {
      const { moduleKey, actions = [] } = mod;

      const tenantModule = await TenantModule.findOne({
        key: moduleKey.toUpperCase(),
        isActive: true
      });

      if (!tenantModule)
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.INVALID_MODULE_KEY.replace('{moduleKey}', moduleKey)
        );

      const validActions = [];

      for (const act of actions) {
        const tenantAction = tenantModule.actions.find(
          a =>
            a.key === act.actionKey.toUpperCase() &&
            a.isActive
        );

        if (!tenantAction)
          return responseFormatter.error(
            req,
            res,
            400,
            MSG.INVALID_ACTION_KEY.replace('{actionKey}', act.actionKey)
          );

        validActions.push({
          actionKey: tenantAction.key,
          actionName: tenantAction.actionName,
          allowed: !!act.allowed
        });
      }

      newModules.push({
        moduleKey: tenantModule.key,
        moduleName: tenantModule.moduleName,
        actions: validActions
      });
    }

    plan.modules = newModules;
    plan.markModified('modules');
    await plan.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'ASSIGN_MODULES',
      module: 'PLANS',
      entityId: plan._id,
      entityName: plan.name?.[req.lang] || plan.name?.[DEFAULT_LANG],
      after: plan,
      message: req.t(MSG.MODULES_ASSIGNED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.MODULES_ASSIGNED,
      localizePlan(plan, req.lang),
      null,
      200
    );
  } catch (err) {
    console.error('Assign modules error:', err);
    return responseFormatter.error(req, res, 500, MSG.MODULES_ASSIGN_FAILED);
  }
};

