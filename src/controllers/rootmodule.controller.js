const RootModule = require('../models/RootModule');                 // Root system module registry
const auditLogger = require('../utils/auditLogger');               // Centralized audit logger
const responseFormatter = require('../utils/responseFormatter');   // Standard API response helper
const { 
  syncNewModuleToRoles, 
  syncNewActionToRoles, 
  disableModuleInAllRoles, 
  disableActionInAllRoles 
} = require('../services/permissionSync.service');                 // Role permission sync helpers
const MSG = require('../config/constants/messageKeys');            // i18n message keys

/**
 * CREATE MODULE
 */
const createModule = async (req, res) => {
  try {
    const { key, moduleName, actions = [] } = req.body;

    /**
     * ======================================================
     * 1️⃣ Validate Required Fields
     * ======================================================
     */
    if (!key || !moduleName || typeof moduleName !== 'object') {
      return responseFormatter.error(req, res, 400, MSG.MODULE_KEY_REQUIRED);
    }

    const moduleKey = key.trim().toUpperCase();

    /**
     * ======================================================
     * 2️⃣ Prevent Duplicate Module Key
     * ======================================================
     */
    const existing = await RootModule.findOne({ key: moduleKey });
    if (existing) {
      return responseFormatter.error(req, res, 409, MSG.MODULE_EXISTS);
    }

    /**
     * ======================================================
     * 3️⃣ Normalize Module Name (Multilingual)
     * ======================================================
     */
    const normalizedModuleName = {
      en: moduleName.en?.trim() || '',
      fr: moduleName.fr?.trim() || '',
      ar: moduleName.ar?.trim() || ''
    };

    /**
     * ======================================================
     * 4️⃣ Validate & Normalize Actions
     * ======================================================
     */
    const normalizedActions = [];
    const seenActionKeys = new Set();

    for (const a of actions) {
      if (!a.key || !a.actionName || typeof a.actionName !== 'object') {
        return responseFormatter.error(req, res, 400, MSG.INVALID_ACTION_PAYLOAD);
      }

      const actionKey = a.key.trim().toUpperCase();

      if (seenActionKeys.has(actionKey)) {
        return responseFormatter.error(req, res, 400, MSG.DUPLICATE_ACTION_KEY);
      }

      seenActionKeys.add(actionKey);

      normalizedActions.push({
        key: actionKey,
        actionName: {
          en: a.actionName.en?.trim() || '',
          fr: a.actionName.fr?.trim() || '',
          ar: a.actionName.ar?.trim() || ''
        }
      });
    }

    /**
     * ======================================================
     * 5️⃣ Create Module (MATCHING SCHEMA)
     * ======================================================
     */
    const module = await RootModule.create({
      key: moduleKey,
      moduleName: normalizedModuleName,   // ✅ CORRECT FIELD
      actions: normalizedActions.map(a => ({
        key: a.key,
        actionName: a.actionName          // ✅ CORRECT FIELD
      })),
      createdBy: req.user._id
    });

    /**
     * ======================================================
     * 6️⃣ Audit Log
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_MODULE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: normalizedModuleName.en || moduleKey,
      after: module,
      message: req.t(MSG.MODULE_CREATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_CREATED,
      module,
      "",
      201
    );

  } catch (err) {
    console.error('Create module error:', err);
    return responseFormatter.error(req, res, 500, MSG.MODULE_CREATE_FAILED);
  }
};


/**
 * LIST MODULES (PAGINATED)
 */
const listModules = async (req, res) => {
  try {
    // Prefer query params for GET requests; keep body as fallback for compatibility.
    const source = Object.keys(req.query || {}).length ? req.query : req.body;
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      moduleKey = ''
    } = source;                                                    // Extract filters

    const query = {};                                             // MongoDB query builder

    if (search) {
      query.$or = [
        { 'moduleName.en': { $regex: search, $options: 'i' } },   // Search by English name
        { 'moduleName.fr': { $regex: search, $options: 'i' } },   // Search by French name
        { 'moduleName.ar': { $regex: search, $options: 'i' } },   // Search by Arabic name
        { key: { $regex: search, $options: 'i' } }                // Search by key
      ];
    }

    if (status) query.isActive = status.toLowerCase() === 'active'; // Status filter
    if (moduleKey) query.key = moduleKey.toUpperCase();             // Key filter

    const skip = (Number(page) - 1) * Number(limit);              // Pagination offset

    const [modules, total] = await Promise.all([
      RootModule.find(query)
        .sort({ createdAt: -1 })                                  // Newest first
        .skip(skip)                                               // Pagination skip
        .limit(Number(limit)),                                    // Page size
      RootModule.countDocuments(query)                            // Total count
    ]);

    return responseFormatter.success(
      req,
      res,
      MSG.MODULE_LIST_FETCHED,
      modules,
      {
        page: Number(page),
        limit: Number(limit),
        search,
        status,
        moduleKey,
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      201
    );

  } catch (err) {
    console.error('List modules error:', err);                     // Log error
    return responseFormatter.error(req, res, 500, MSG.MODULE_LIST_FAILED);
  }
};

/**
 * GET SINGLE MODULE
 */
const getModule = async (req, res) => {
  try {
    const module = await RootModule.findById(req.params.id);       // Load module by ID
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND); // Not found
    return responseFormatter.success(req, res, MSG.MODULE_FETCHED, module, "", 201);
  } catch (err) {
    console.error(err);                                           // Log error
    return responseFormatter.error(req, res, 500, MSG.MODULE_FETCH_FAILED);
  }
};

/**
 * UPDATE MODULE
 */
const updateModule = async (req, res) => {
  try {
    const { moduleName, modulename, isActive } = req.body;         // Extract update fields

    if (moduleName === undefined && modulename === undefined && isActive === undefined) {
      return responseFormatter.error(req, res, 400, MSG.NOTHING_TO_UPDATE); // No updates provided
    }

    const module = await RootModule.findById(req.params.id);       // Load module
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    const before = module.toObject();                              // Snapshot before update

    if (moduleName !== undefined && typeof moduleName === 'object') {
      module.moduleName = {
        en: moduleName.en?.trim() || module.moduleName?.en || '',
        fr: moduleName.fr?.trim() || module.moduleName?.fr || '',
        ar: moduleName.ar?.trim() || module.moduleName?.ar || ''
      };
    } else if (modulename !== undefined) {
      // Backward compatibility with old payload shape.
      module.moduleName = {
        en: String(modulename).trim(),
        fr: module.moduleName?.fr || '',
        ar: module.moduleName?.ar || ''
      };
    }

    if (isActive !== undefined) {
      module.isActive = !!isActive;                                // Update status
      if (!isActive) await disableModuleInAllRoles(module.key);   // Cascade disable in roles
    }

    await module.save();                                          // Persist changes

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_MODULE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.moduleName?.en || module.key,
      before,
      after: module,
      message: req.t(MSG.MODULE_UPDATED)
    });

    return responseFormatter.success(req, res, MSG.MODULE_UPDATED, module, "", 201);

  } catch (err) {
    console.error(err);                                           // Log error
    return responseFormatter.error(req, res, 500, MSG.MODULE_UPDATE_FAILED);
  }
};

/**
 * DELETE MODULE
 */
const deleteModule = async (req, res) => {
  try {
    const module = await RootModule.findById(req.params.id);       // Load module
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    const before = module.toObject();                              // Snapshot before delete

    module.isActive = false;                                       // Soft delete module
    await module.save();
    await disableModuleInAllRoles(module.key);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_MODULE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.moduleName?.en || module.key,
      before,
      after: module,
      message: req.t(MSG.MODULE_DELETED)
    });

    return responseFormatter.success(req, res, MSG.MODULE_DELETED, module, null, 201);

  } catch (err) {
    console.error(err);                                           // Log error
    return responseFormatter.error(req, res, 500, MSG.MODULE_DELETE_FAILED);
  }
};

/**
 * TOGGLE MODULE STATUS
 */
const toggleModuleStatus = async (req, res) => {
  try {
    const { isActive } = req.body;                                 // Extract status

    const module = await RootModule.findById(req.params.id);       // Load module
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    module.isActive = !!isActive;                                  // Set active flag
    await module.save();                                          // Persist

    if (!isActive) await disableModuleInAllRoles(module.key);     // Cascade disable

    return responseFormatter.success(req, res, MSG.MODULE_STATUS_UPDATED, module, null, 201);

  } catch (err) {
    console.error(err);                                           // Log error
    return responseFormatter.error(req, res, 500, MSG.MODULE_STATUS_UPDATE_FAILED);
  }
};

/**
 * ADD ACTION TO MODULE
 */
const addAction = async (req, res) => {
  try {
    const { key, actionName } = req.body;

    /**
     * ======================================================
     * 1️⃣ Validate Required Fields
     * ======================================================
     */
    if (!key || !actionName || typeof actionName !== 'object') {
      return responseFormatter.error(req, res, 400, MSG.ACTION_KEY_REQUIRED);
    }

    const module = await RootModule.findById(req.params.id);
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    if (!module.isActive) return responseFormatter.error(req, res, 400, MSG.MODULE_INACTIVE);

    /**
     * ======================================================
     * 2️⃣ Normalize Action Key
     * ======================================================
     */
    const normalizedKey = key.trim().toUpperCase();

    /**
     * ======================================================
     * 3️⃣ Prevent Duplicate Action Key
     * ======================================================
     */
    if (module.actions.some(a => a.key === normalizedKey)) {
      return responseFormatter.error(req, res, 409, MSG.ACTION_EXISTS);
    }

    /**
     * ======================================================
     * 4️⃣ Normalize Multilingual Action Name
     * ======================================================
     */
    const normalizedActionName = {
      en: actionName.en?.trim() || '',
      fr: actionName.fr?.trim() || '',
      ar: actionName.ar?.trim() || ''
    };

    /**
     * ======================================================
     * 5️⃣ Prevent Duplicate Action Name (Any Language)
     * ======================================================
     */
    const isDuplicateName = module.actions.some(a => {
      const existing = a.actionName || {};
      return (
        existing.en?.toLowerCase() === normalizedActionName.en.toLowerCase() ||
        existing.fr?.toLowerCase() === normalizedActionName.fr.toLowerCase() ||
        existing.ar?.toLowerCase() === normalizedActionName.ar.toLowerCase()
      );
    });

    if (isDuplicateName) {
      return responseFormatter.error(req, res, 409, MSG.ACTION_NAME_EXISTS);
    }

    /**
     * ======================================================
     * 6️⃣ Create New Action (Schema Correct)
     * ======================================================
     */
    const newAction = {
      key: normalizedKey,
      actionName: normalizedActionName,
      isActive: true
    };

    module.actions.push(newAction);
    await module.save();

    /**
     * ======================================================
     * 7️⃣ Audit Log
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'ADD_ACTION',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.moduleName?.en || module.key,
      after: newAction,
      message: req.t(MSG.ACTION_ADDED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ACTION_ADDED,
      module,
      null,
      201
    );

  } catch (err) {
    console.error('Add action error:', err);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'ADD_ACTION',
      module: 'ROOT_MODULES',
      status: 'FAILED',
      message: err.message
    });

    return responseFormatter.error(req, res, 500, MSG.ACTION_ADD_FAILED);
  }
};


/**
 * UPDATE ACTION
 */
const updateAction = async (req, res) => {
  try {
    const { actionKey, newKey, newName, isActive } = req.body;   
    
// Extract payload

    if (!actionKey) {
      return responseFormatter.error(req, res, 400, MSG.ACTION_KEY_REQUIRED); // Required field
    }

    const module = await RootModule.findById(req.params.id);       // Load module

    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    const action = module.actions.find(
    //  a => a.key === actionKey.toLowerCase()
     a => a.key && a.key.trim().toLowerCase() === actionKey.trim().toLowerCase()
    );                                                             // Find action


    if (!action) return responseFormatter.error(req, res, 404, MSG.ACTION_NOT_FOUND);

    const before = { ...action.toObject ? action.toObject() : action }; // Snapshot before

    if (newKey) {
      const normalizedNewKey = newKey.toLowerCase();               // Normalize new key

      if (module.actions.some(a => a.key === normalizedNewKey && a.key !== action.key)) {
        return responseFormatter.error(req, res, 409, MSG.ACTION_EXISTS); // Duplicate key
      }

      action.key = normalizedNewKey;                               // Update key
    }

    if (newName) {
      const normalizedNewName = newName.toLowerCase();             // Normalize new name

      if (module.actions.some(a => a.actionsname.toLowerCase() === normalizedNewName && a.key !== action.key)) {
        return responseFormatter.error(req, res, 409, MSG.ACTION_NAME_EXISTS); // Duplicate name
      }

      action.actionsname = newName.trim();                         // Update name
    }

    if (typeof isActive === 'boolean') {
      action.isActive = isActive;                                  // Update active flag

      if (!isActive) {
        await disableActionInAllRoles(module.key, action.key);    // Cascade disable
      }
    }

    await module.save();                                          // Persist

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ACTION',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.modulename,
      before,
      after: action,
      message: req.t(MSG.ACTION_UPDATED)
    });

    return responseFormatter.success(req, res, MSG.ACTION_UPDATED, module, null, 201);

  } catch (err) {
    console.error(err);                                           // Log error

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_ACTION',
      module: 'ROOT_MODULES',
      status: 'FAILED',
      message: err.message
    });

    return responseFormatter.error(req, res, 500, MSG.ACTION_UPDATE_FAILED);
  }
};

/**
 * DELETE ACTION
 */
const deleteAction = async (req, res) => {
  try {
    const { actionKey } = req.body;

    /**
     * ======================================================
     * 1️⃣ Validate Required Field
     * ======================================================
     */
    if (!actionKey) {
      return responseFormatter.error(req, res, 400, MSG.ACTION_KEY_REQUIRED);
    }

    const normalizedKey = actionKey.trim().toUpperCase();

    /**
     * ======================================================
     * 2️⃣ Load Module
     * ======================================================
     */
    const module = await RootModule.findById(req.params.id);
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    /**
     * ======================================================
     * 3️⃣ Find Action
     * ======================================================
     */
    const index = module.actions.findIndex(a => a.key === normalizedKey);
    if (index === -1) {
      return responseFormatter.error(req, res, 404, MSG.ACTION_NOT_FOUND);
    }

    const action = module.actions[index];
    const before = action.toObject ? action.toObject() : action;

    /**
     * ======================================================
     * 4️⃣ Remove Action
     * ======================================================
     */
    module.actions.splice(index, 1);
    await module.save();

    // Optional cascade
    // await disableActionInAllRoles(module.key, action.key);

    /**
     * ======================================================
     * 5️⃣ Audit Log
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_ACTION',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.moduleName?.en || module.key,
      before,
      after: null,
      message: req.t(MSG.ACTION_DELETED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.ACTION_DELETED,
      module,
      null,
      201
    );

  } catch (err) {
    console.error('Delete action error:', err);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_ACTION',
      module: 'ROOT_MODULES',
      status: 'FAILED',
      message: err.message
    });

    return responseFormatter.error(req, res, 500, MSG.ACTION_DELETE_FAILED);
  }
};


/**
 * EXPORT ALL CONTROLLERS
 */
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
