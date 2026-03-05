const Role = require('../models/rbac/SystemRole');

const SUPER_ADMIN_ROLE_NAME = 'SUPER ADMIN';

/**
 * When a new module is created, sync its actions to all roles
 */
exports.syncNewModuleToRoles = async (module) => {
  if (!module.actions || module.actions.length === 0) return;

  const roles = await Role.find();

  for (const role of roles) {
    const isSuperAdmin = role.isSystemRole === true || role.name === SUPER_ADMIN_ROLE_NAME;

    for (const action of module.actions) {
      const exists = role.permissions.some(
        p => p.moduleKey === module.key && p.actionKey === action.key
      );

      if (!exists) {
        role.permissions.push({
          moduleKey: module.key,
          actionKey: action.key,
          allowed: isSuperAdmin
        });
      }
    }

    await role.save();
  }
};

/**
 * When a new action is added to an existing module
 */
exports.syncNewActionToRoles = async (moduleKey, actionKey) => {
  const roles = await Role.find();

  for (const role of roles) {
    const isSuperAdmin = role.isSystemRole === true || role.name === SUPER_ADMIN_ROLE_NAME;

    const exists = role.permissions.some(
      p => p.moduleKey === moduleKey && p.actionKey === actionKey
    );

    if (!exists) {
      role.permissions.push({
        moduleKey,
        actionKey,
        allowed: isSuperAdmin
      });
      await role.save();
    }
  }
};

/**
 * Disable a module globally (does NOT affect SUPER ADMIN/system roles)
 */
exports.disableModuleInAllRoles = async (moduleKey) => {
  const roles = await Role.find({ isSystemRole: false });

  for (const role of roles) {
    let updated = false;

    if (!Array.isArray(role.permissions)) continue;

    for (const perm of role.permissions) {
      if (perm.moduleKey === moduleKey) {
        perm.allowed = false;
        updated = true;
      }
    }

    if (updated) {
      await role.save();
    }
  }
};


/**
 * Disable an action globally (does NOT affect SUPER ADMIN/system roles)
 */
exports.disableActionInAllRoles = async (moduleKey, actionKey) => {
  await Role.updateMany(
    { isSystemRole: false },
    { $set: { "permissions.$[p].allowed": false } },
    { arrayFilters: [{ "p.moduleKey": moduleKey, "p.actionKey": actionKey }] }
  );
};

/**
 * Re-sync all modules and actions to all roles
 * Useful if new modules/actions added after initial creation
 */
exports.resyncAllModulesAndActions = async (modules) => {
  const roles = await Role.find();

  for (const role of roles) {
    const isSuperAdmin = role.isSystemRole === true || role.name === SUPER_ADMIN_ROLE_NAME;

    for (const module of modules) {
      for (const action of module.actions) {
        const exists = role.permissions.some(
          p => p.moduleKey === module.key && p.actionKey === action.key
        );

        if (!exists) {
          role.permissions.push({
            moduleKey: module.key,
            actionKey: action.key,
            allowed: isSuperAdmin
          });
        }
      }
    }

    await role.save();
  }
};
