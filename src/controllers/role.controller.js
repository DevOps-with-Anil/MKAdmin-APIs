const RootRole = require('../models/Role');
const RootModule = require('../models/RootModule');

/**
 * CREATE ROLE
 */
exports.create = async (req, res) => {
  const exists = await RootRole.findOne({ name: req.body.name });
  if (exists) {
    return res.status(400).json({ message: 'Role already exists' });
  }

  const role = await RootRole.create(req.body);
  res.json(role);
};

/**
 * LIST ROLES
 */
exports.list = async (req, res) => {
  const roles = await RootRole.find()
  res.json(roles);
};

/**
 * UPDATE ROLE INFO
 */
exports.update = async (req, res) => {
  const role = await RootRole.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description
    },
    { new: true }
  );

  res.json(role);
};

/**
 * UPDATE ROLE STATUS
 */
exports.updateStatus = async (req, res) => {
  const role = await RootRole.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(role);
};

/**
 * ASSIGN PERMISSIONS TO ROLE
 */

exports.assignPermissions = async (req, res) => {
  const { permissions } = req.body;

  for (const perm of permissions) {
    // 1. Validate module by NAME
    const module = await RootModule.findOne({
      name: perm.moduleName,
      status: 'ACTIVE'
    });

    if (!module) {
      return res.status(400).json({
        message: `Invalid or inactive module: ${perm.moduleName}`
      });
    }

    // 2. Get valid ACTIVE action names
    const validActionNames = module.actions
      .filter(a => a.status === 'ACTIVE')
      .map(a => a.name);

    // 3. Validate each action NAME
    for (const actionName of perm.actions) {
      if (!validActionNames.includes(actionName)) {
        return res.status(400).json({
          message: `Invalid or inactive action ${actionName} for module ${perm.moduleName}`
        });
      }
    }
  }

  // 4. Save permissions
  const role = await RootRole.findByIdAndUpdate(
    req.params.id,
    { permissions },
    { new: true }
  );

  res.json(permissions);

  // res.json(role);
};
