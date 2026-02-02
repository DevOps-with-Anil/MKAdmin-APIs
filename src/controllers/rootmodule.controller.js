const RootModule = require('../models/RootModule');
const auditLogger = require('../utils/auditLogger');



/**
 * CREATE MODULE
 */
exports.createModule = async (req, res) => {
  const { name, actions = [] } = req.body;

  const exists = await RootModule.findOne({ name });
  if (exists) {
    return res.status(400).json({ message: 'Module already exists' });
  }

  // Validate duplicate action names
  const actionNames = actions.map(a => a.name.toUpperCase());
  const unique = new Set(actionNames);
  if (unique.size !== actionNames.length) {
    return res.status(400).json({ message: 'Duplicate action names in module' });
  }


  try {
    const module = await RootModule.create({
    name,
    actions,
    level: 'ROOT'
  });
  
  await auditLogger({
      req,
      user: req.user,
      action: 'CREATE',
      module: 'ROOT_MODULES',
      entityId: module._id,
      entityName: module.name,
      after: module,
      message: 'Root module created'
    });

    res.json(module);
    } catch (err) {
  await auditLogger({
      req,
      user: req.user,
      action: 'CREATE',
      module: 'ROOT_MODULES',
      status: 'FAILED',
      message: err.message
    });

    throw err;
  }
};

/**
 * LIST MODULES
 */
exports.listModules = async (req, res) => {
  const modules = await RootModule.find().sort({ createdAt: 1 });
  res.json(modules);
};

/**
 * UPDATE MODULE
 */
exports.updateModule = async (req, res) => {
  const module = await RootModule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!module) {
    return res.status(404).json({ message: 'Module not found' });
  }

  res.json(module);
};

/**
 * UPDATE MODULE STATUS
 */
exports.updateModuleStatus = async (req, res) => {
  const module = await RootModule.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(module);
};

/**
 * ADD ACTION TO MODULE
 */
exports.addAction = async (req, res) => {
  const { name } = req.body;

  const module = await RootModule.findById(req.params.id);
  if (!module) {
    return res.status(404).json({ message: 'Module not found' });
  }

  const exists = module.actions.find(
    a => a.name === name.toUpperCase()
  );

  if (exists) {
    return res.status(400).json({ message: 'Action already exists in module' });
  }

  module.actions.push({ name });
  await module.save();

  res.json(module);
};

/**
 * UPDATE ACTION STATUS
 */
exports.updateActionStatus = async (req, res) => {
  const { actionName, status } = req.body;

  const module = await RootModule.findById(req.params.id);
  if (!module) {
    return res.status(404).json({ message: 'Module not found' });
  }

  const action = module.actions.find(
    a => a.name === actionName.toUpperCase()
  );

  if (!action) {
    return res.status(404).json({ message: 'Action not found' });
  }

  action.status = status;
  await module.save();

  // res.json({ message: 'Action updated successfully.' });
  res.json(module);
};

/**
 * DELETE ACTION FROM MODULE
 */
exports.deleteAction = async (req, res) => {
  const { actionName } = req.body;

  const module = await RootModule.findById(req.params.id);
  if (!module) {
    return res.status(404).json({ message: 'Module not found' });
  }

  module.actions = module.actions.filter(
    a => a.name !== actionName.toUpperCase()
  );

  await module.save();

  res.json(module);
};
