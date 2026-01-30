module.exports.hasPermission = (role, moduleName, action) => {
const perm = role.permissions.find(p => p.module === moduleName);
if (!perm) return false;
return perm.actions.includes(action);
};