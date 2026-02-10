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
    const { key, modulename, actions = [] } = req.body;            // Extract module payload

    if (!key || !modulename) {
      return responseFormatter.error(req, res, 400, MSG.MODULE_KEY_REQUIRED); // Required fields check
    }

    const existing = await RootModule.findOne({ 
      key: key.toLowerCase().trim() 
    });                                                            // Check duplicate module key

    if (existing) {
      return responseFormatter.error(req, res, 409, MSG.MODULE_EXISTS); // Prevent duplicate module
    }

    const actionKeys = actions.map(a => a.key.toLowerCase());      // Normalize action keys
    if (new Set(actionKeys).size !== actionKeys.length) {
      return responseFormatter.error(req, res, 400, MSG.DUPLICATE_ACTION_KEY); // Prevent duplicate actions
    }

    const module = await RootModule.create({
      key: key.toLowerCase().trim(),                               // Normalized module key
      modulename: modulename.trim(),                               // Clean module name
      actions: actions.map(a => ({
        key: a.key.toLowerCase(),                                  // Normalized action key
        actionsname: a.actionsname                                 // Action display name
      })),
      createdBy: req.user._id                                      // Audit creator
    });

    // Optional: auto-sync new module to all roles
    // await syncNewModuleToRoles(module);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_MODULE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.modulename,
      after: module,
      message: req.t(MSG.MODULE_CREATED)
    });

    return responseFormatter.success(req, res, MSG.MODULE_CREATED, module, null, 201);

  } catch (err) {
    console.error(err);                                           // Log server error
    return responseFormatter.error(req, res, 500, MSG.MODULE_CREATE_FAILED);
  }
};

/**
 * LIST MODULES (PAGINATED)
 */
const listModules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      moduleKey = ''
    } = req.body;                                                  // Extract filters

    const query = {};                                             // MongoDB query builder

    if (search) {
      query.$or = [
        { modulename: { $regex: search, $options: 'i' } },        // Search by name
        { key: { $regex: search, $options: 'i' } }                // Search by key
      ];
    }

    if (status) query.isActive = status.toLowerCase() === 'active'; // Status filter
    if (moduleKey) query.key = moduleKey.toLowerCase();             // Key filter

    const skip = (Number(page) - 1) * Number(limit);              // Pagination offset

    const [modules, total] = await Promise.all([
      RootModule.find(query)
        .sort({ createdAt: 1 })                                   // Oldest first
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
    return responseFormatter.success(req, res, MSG.MODULE_FETCHED, module, null, 201);
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

    const { modulename, isActive } = req.body;                     // Extract update fields

    if (modulename === undefined && isActive === undefined) {
      return responseFormatter.error(req, res, 400, MSG.NOTHING_TO_UPDATE); // No updates provided
    }

    const module = await RootModule.findById(req.params.id);       // Load module
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    const before = module.toObject();                              // Snapshot before update

    if (modulename !== undefined) module.modulename = modulename.trim(); // Update name

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
      entityName: module.modulename,
      before,
      after: module,
      message: req.t(MSG.MODULE_UPDATED)
    });

    return responseFormatter.success(req, res, MSG.MODULE_UPDATED, module, null, 201);

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

    await RootModule.findByIdAndDelete(req.params.id);             // Hard delete module

    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_MODULE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.modulename,
      before,
      after: null,
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
    const { key, actionsname } = req.body;                         // Extract action payload

    if (!key || !actionsname) {
      return responseFormatter.error(req, res, 400, MSG.ACTION_KEY_REQUIRED); // Required fields
    }

    const module = await RootModule.findById(req.params.id);       // Load module
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);
    if (!module.isActive) return responseFormatter.error(req, res, 400, MSG.MODULE_INACTIVE);

    const normalizedKey = key.trim().toLowerCase();                // Normalize key
    const normalizedName = actionsname.trim().toLowerCase();       // Normalize name

    if (module.actions.some(a => a.key === normalizedKey)) {
      return responseFormatter.error(req, res, 409, MSG.ACTION_EXISTS); // Duplicate action key
    }

    if (module.actions.some(a => a.actionsname.toLowerCase() === normalizedName)) {
      return responseFormatter.error(req, res, 409, MSG.ACTION_NAME_EXISTS); // Duplicate action name
    }

    const newAction = { 
      key: normalizedKey, 
      actionsname: actionsname.trim(), 
      isActive: true 
    };                                                             // New action object

    module.actions.push(newAction);                                // Append action
    await module.save();                                          // Persist

    // Optional: auto-sync new action to roles
    // await syncNewActionToRoles(module.key, normalizedKey);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'ADD_ACTION',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.modulename,
      after: newAction,
      message: req.t(MSG.ACTION_ADDED)
    });

    return responseFormatter.success(req, res, MSG.ACTION_ADDED, module, null, 201);

  } catch (err) {
    console.error(err);                                           // Log error

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
    const { actionKey } = req.body;                                // Extract action key

    if (!actionKey) {
      return responseFormatter.error(req, res, 400, MSG.ACTION_KEY_REQUIRED); // Required field
    }

    const module = await RootModule.findById(req.params.id);       // Load module
    if (!module) return responseFormatter.error(req, res, 404, MSG.MODULE_NOT_FOUND);

    const index = module.actions.findIndex(
      a => a.key === actionKey.toLowerCase()
    );                                                             // Find action index

    if (index === -1) {
      return responseFormatter.error(req, res, 404, MSG.ACTION_NOT_FOUND); // Not found
    }

    const action = module.actions[index];                          // Target action
    const before = { ...action.toObject ? action.toObject() : action }; // Snapshot before

    module.actions.splice(index, 1);                               // Remove action
    await module.save();                                          // Persist

    // Optional: cascade disable in roles
    // await disableActionInAllRoles(module.key, action.key);

    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_ACTION',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.modulename,
      before,
      after: null,
      message: req.t(MSG.ACTION_DELETED)
    });

    return responseFormatter.success(req, res, MSG.ACTION_DELETED, module, null);

  } catch (err) {
    console.error(err);                                           // Log error

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
