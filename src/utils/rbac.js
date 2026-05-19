// utils/rbac.util.js

/**
 * Check if role is system/root admin
 */
const isSystemRole = (role) => {
  if (!role) return false;

  // const roleNameEn = role.name?.en || '';
  // return role.isSystemRole === true || roleNameEn === 'ROOT ADMIN' || roleNameEn === 'Tenant Super Admin';
  return role.isSystemRole === true;
};


/**
 * Core permission checker
 */
const hasPermission = (role, moduleKey, actionKey) => {
  if (!role || !role.permissions) return false;

  // System role → always allowed
  if (isSystemRole(role)) return true;

  // console.log("ROle" + "   "+ role.permissions);

  return role.permissions.some(permission =>
    (permission.moduleKey === moduleKey || permission.moduleKey === '*') &&
    permission.allowed === true &&
    permission.actions?.some(action =>
      (action.actionKey === actionKey || action.actionKey === '*') &&
      action.allowed === true
    )
  );
};


module.exports = {
  hasPermission,
  isSystemRole
};