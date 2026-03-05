const RootModule = require('../../models/rbac/SystemModule');
const auditLogger = require('../../utils/auditLogger');
const responseFormatter = require('../../utils/responseFormatter');
const {
  disableModuleInAllRoles,
  disableActionInAllRoles
} = require('../../services/permissionSync.service');
const MSG = require('../../config/constants/messageKeys');
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
 * 🌍 Helper: Localize module output dynamically
 * ============================================================
 */
function localizeModule(module, lang) {
  const obj = module.toObject();

  obj.moduleName =
    obj.moduleName?.[lang] || obj.moduleName?.[DEFAULT_LANG];

  obj.description =
    obj.description?.[lang] || obj.description?.[DEFAULT_LANG];

  if (Array.isArray(obj.actions)) {
    obj.actions = obj.actions.map(action => ({
      ...action,
      actionName:
        action.actionName?.[lang] ||
        action.actionName?.[DEFAULT_LANG]
    }));
  }

  return obj;
}

/**
 * ============================================================
 * CREATE MODULE
 * ============================================================
 */
const createModule = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { key, moduleName, description, actions = [] } = req.body;

    if (!key || !moduleName || typeof moduleName !== "object") {
      return responseFormatter.error(req, res, 400, MSG.MODULE_KEY_REQUIRED);
    }

    const nameValidation = validateLocalizedField(moduleName, "moduleName");
    if (nameValidation) {
      return responseFormatter.error(req, res, 400, nameValidation);
    }

    const moduleKey = key.trim().toUpperCase();

    const existing = await RootModule.findOne({ key: moduleKey });
    if (existing) {
      return responseFormatter.error(req, res, 409, MSG.MODULE_EXISTS);
    }

    const normalizedModuleName = {};
    const normalizedDescription = {};

    for (const langKey of SUPPORTED_LANGS) {
      normalizedModuleName[langKey] =
        moduleName?.[langKey]?.trim() || "";
      normalizedDescription[langKey] =
        description?.[langKey]?.trim() || "";
    }

    const normalizedActions = [];
    const seenKeys = new Set();

    for (const action of actions) {
      if (!action.key || !action.actionName) {
        return responseFormatter.error(req, res, 400, MSG.INVALID_ACTION_PAYLOAD);
      }

      const actionKey = action.key.trim().toUpperCase();

      if (seenKeys.has(actionKey)) {
        return responseFormatter.error(req, res, 400, MSG.DUPLICATE_ACTION_KEY);
      }

      seenKeys.add(actionKey);

      const validation = validateLocalizedField(action.actionName, "actionName");
      if (validation) {
        return responseFormatter.error(req, res, 400, validation);
      }

      const normalizedActionName = {};
      for (const langKey of SUPPORTED_LANGS) {
        normalizedActionName[langKey] =
          action.actionName?.[langKey]?.trim() || "";
      }

      normalizedActions.push({
        key: actionKey,
        actionName: normalizedActionName,
        isActive: true
      });
    }

    const module = await RootModule.create({
      key: moduleKey,
      moduleName: normalizedModuleName,
      description: normalizedDescription,
      actions: normalizedActions,
      createdBy: req.user._id
    });

    /**
     * ======================================================
     * Audit Log (Before & After Structure)
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_MODULE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: normalizedModuleName[DEFAULT_LANG] || moduleKey,
      before: null,
      after: {
        key: module.key,
        moduleName: module.moduleName,
        description: module.description,
        actions: module.actions
      },
      message: req.t(MSG.MODULE_CREATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_CREATED,
      localizeModule(module, lang),
      null,
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.MODULE_CREATE_FAILED);
  }
};

/**
 * ============================================================
 * LIST MODULES (PAGINATED + FILTER)
 * ============================================================
 */
const listModules = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;

    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      moduleKey = ''
    } = req.body;

    const query = {};

    if (search) {
      query.$or = [
        { key: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status.toLowerCase() === 'active';
    }

    if (moduleKey) {
      query.key = moduleKey.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [modules, total] = await Promise.all([
      RootModule.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      RootModule.countDocuments(query)
    ]);

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_LIST_FETCHED,
      modules.map(m => localizeModule(m, lang)),
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.MODULE_LIST_FAILED);
  }
};

/**
 * ============================================================
 * GET MODULE
 * ============================================================
 */
const getModule = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;

    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_FETCHED,
      localizeModule(module, lang),
      null,
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.MODULE_FETCH_FAILED);
  }
};

/**
 * ============================================================
 * UPDATE MODULE
 * ============================================================
 */
const updateModule = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { moduleName, description, isActive } = req.body;

    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    /**
     * ======================================================
     * 1️⃣ Capture BEFORE snapshot
     * ======================================================
     */
    const beforeData = JSON.parse(JSON.stringify({
    moduleName: module.moduleName,
    description: module.description,
    isActive: module.isActive
    }));

    /**
     * ============================================================
     * 🌍 Update Module Name (Localized)
     * ============================================================
     */
    if (moduleName) {
      const validation = validateLocalizedField(moduleName, "moduleName");
      if (validation) {
        return responseFormatter.error(req, res, 400, validation);
      }

      for (const langKey of SUPPORTED_LANGS) {
        module.moduleName.set
          ? module.moduleName.set(langKey, moduleName[langKey].trim())
          : (module.moduleName[langKey] = moduleName[langKey].trim());
      }

      module.markModified("moduleName");
    }

    /**
     * ============================================================
     * 🌍 Update Description
     * ============================================================
     */
    if (description) {
      for (const langKey of SUPPORTED_LANGS) {
        module.description[langKey] =
          description?.[langKey]?.trim() || "";
      }

      module.markModified("description");
    }

    /** 
     * ============================================================
     * 🔁 Update Active Status
     * ============================================================
     */
    if (typeof isActive === "boolean") {
      module.isActive = isActive;
    }

    await module.save();

    /**
     * ======================================================
     * 2️⃣ Capture AFTER snapshot
     * ======================================================
     */
    const afterData = {
    moduleName: module.moduleName,
    description: module.description,
    isActive: module.isActive
    };

    /**
     * ======================================================
     * 3️⃣ Audit Log with Before & After
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "UPDATE_MODULE",
      module: "ROOT_MODULES",
      entityId: module._id,
      entityName: module.moduleName?.[DEFAULT_LANG] || module.key,
      before: beforeData,
      after: afterData,
      message: req.t(MSG.MODULE_UPDATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_UPDATED,
      localizeModule(module, lang),
      null,
      200
    );

  } catch (err) {
    console.error("Update Module Error:", err);
    return responseFormatter.error(req, res, 500, MSG.MODULE_UPDATE_FAILED);
  }
};

/**
 * ============================================================
 * DELETE MODULE
 * ============================================================
 */
const deleteModule = async (req, res) => {
  try {
    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    await RootModule.findByIdAndDelete(req.params.id);

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_DELETED,
      module,
      null,
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.MODULE_DELETE_FAILED);
  }
};

/**
 * ============================================================
 * TOGGLE MODULE STATUS
 * ============================================================
 */
const toggleModuleStatus = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { isActive } = req.body;

    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    /**
     * ======================================================
     * 1️⃣ Capture BEFORE snapshot
     * ======================================================
     */
    const beforeData = {
      isActive: module.isActive
    };

    module.isActive = !!isActive;

    let rolesUpdated = false;

    if (!isActive) {
      await disableModuleInAllRoles(module.key);
      rolesUpdated = true;
    }

    await module.save();

    /**
     * ======================================================
     * 2️⃣ Capture AFTER snapshot
     * ======================================================
     */
    const afterData = {
      isActive: module.isActive
    };

    /**
     * ======================================================
     * 3️⃣ Audit Log
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "TOGGLE_MODULE_STATUS",
      module: "ROOT_MODULES",
      entityId: module._id,
      entityName: module.moduleName?.[DEFAULT_LANG] || module.key,
      before: beforeData,
      after: afterData,
      meta: {
        affectedRolesUpdated: rolesUpdated
      },
      message: req.t(MSG.MODULE_STATUS_UPDATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_STATUS_UPDATED,
      localizeModule(module, lang),
      null,
      200
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.MODULE_STATUS_UPDATE_FAILED);
  }
};

/**
 * ============================================================
 * ADD ACTION
 * ============================================================
 */
const addAction = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { key, actionName } = req.body;

    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    const validation = validateLocalizedField(actionName, "actionName");
    if (validation) {
      return responseFormatter.error(req, res, 400, validation);
    }

    const normalizedActionName = {};
    for (const langKey of SUPPORTED_LANGS) {
      normalizedActionName[langKey] =
        actionName?.[langKey]?.trim() || "";
    }

    module.actions.push({
      key: key.trim().toUpperCase(),
      actionName: normalizedActionName,
      isActive: true
    });

    await module.save();

    return responseFormatter.success(
      req,
      res,
      MSG.ACTION_ADDED,
      localizeModule(module, lang),
      null,
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.ACTION_ADD_FAILED);
  }
};

/**
 * ============================================================
 * UPDATE ACTION
 * ============================================================
 */
const updateAction = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { actionKey, newName, isActive } = req.body;

    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    const action = module.actions.find(
      a => a.key === actionKey.trim().toUpperCase()
    );

    if (!action) {
      return responseFormatter.error(req, res, 404, MSG.ACTION_NOT_FOUND);
    }

    if (newName) {
      const validation = validateLocalizedField(newName, "actionName");
      if (validation) {
        return responseFormatter.error(req, res, 400, validation);
      }

      for (const langKey of SUPPORTED_LANGS) {
        action.actionName[langKey] =
          newName?.[langKey]?.trim() || "";
      }
    }

    if (typeof isActive === "boolean") {
      action.isActive = isActive;
      if (!isActive) {
        await disableActionInAllRoles(module.key, action.key);
      }
    }

    await module.save();

    return responseFormatter.success(
      req,
      res,
      MSG.ACTION_UPDATED,
      localizeModule(module, lang),
      null,
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.ACTION_UPDATE_FAILED);
  }
};

/**
 * ============================================================
 * DELETE ACTION
 * ============================================================
 */
const deleteAction = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const { actionKey } = req.body;

    const module = await RootModule.findById(req.params.id);
    if (!module) {
      return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    }

    const index = module.actions.findIndex(
      a => a.key === actionKey.trim().toUpperCase()
    );

    if (index === -1) {
      return responseFormatter.error(req, res, 404, MSG.ACTION_NOT_FOUND);
    }

    const action = module.actions[index];

    module.actions.splice(index, 1);

    await disableActionInAllRoles(module.key, action.key);

    await module.save();

    return responseFormatter.success(
      req,
      res,
      MSG.ACTION_DELETED,
      localizeModule(module, lang),
      null,
      201
    );

  } catch (err) {
    return responseFormatter.error(req, res, 500, MSG.ACTION_DELETE_FAILED);
  }
};

module.exports = {
  createModule,
  listModules,
  getModule,
  updateModule,
  deleteModule,
  toggleModuleStatus,
  addAction,
  updateAction,
  deleteAction
};