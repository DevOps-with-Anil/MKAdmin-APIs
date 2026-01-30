const Module = require('../models/RootModule');

const VALID_STATUS = ['ACTIVE', 'INACTIVE'];
const VALID_LEVELS = ['ROOT'];

/**
 * Create Global Module Package (ROOT or TENANT)
 */
exports.createModule = async (req, res) => {
  const { name, actions = [], level } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Module name is required' });
  }

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ message: 'Invalid module level (ROOT or TENANT)' });
  }

  const formattedActions = actions.map(a => ({
    name: a.name,
    status: a.status || 'ACTIVE'
  }));

  try {
    const mod = await Module.create({
      name,
      actions: formattedActions,
      level
    });

    res.status(201).json(mod);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Module already exists' });
    }
    throw err;
  }
};

/**
 * List All Modules
 * Optional filter by level
 * ?level=ROOT | ?level=TENANT
 */
exports.getModules = async (req, res) => {
  const { level } = req.query;
  const filter = {};

  if (level) {
    if (!VALID_LEVELS.includes(level)) {
      return res.status(400).json({ message: 'Invalid level filter' });
    }
    filter.level = level;
  }

  const modules = await Module.find(filter).sort({ level: 1, name: 1 });
  res.json(modules);
};

/**
 * Update Module Status
 */
exports.updateModuleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const mod = await Module.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!mod) return res.status(404).json({ message: 'Module not found' });

  res.json(mod);
};

/**
 * Add Actions to Module
 */
exports.addActions = async (req, res) => {
  const { id } = req.params;
  const { actions = [] } = req.body;

  const mod = await Module.findById(id);
  if (!mod) return res.status(404).json({ message: 'Module not found' });

  const existing = mod.actions.map(a => a.name);

  const newActions = actions
    .filter(a => a.name && !existing.includes(a.name.toUpperCase()))
    .map(a => ({
      name: a.name,
      status: a.status || 'ACTIVE'
    }));

  mod.actions.push(...newActions);
  await mod.save();

  res.json(mod);
};

/**
 * Replace All Actions
 */
exports.replaceActions = async (req, res) => {
  const { id } = req.params;
  const { actions = [] } = req.body;

  const formattedActions = actions.map(a => ({
    name: a.name,
    status: a.status || 'ACTIVE'
  }));

  const mod = await Module.findByIdAndUpdate(
    id,
    { actions: formattedActions },
    { new: true }
  );

  if (!mod) return res.status(404).json({ message: 'Module not found' });

  res.json(mod);
};

/**
 * Update Single Action Status
 */
exports.updateActionStatus = async (req, res) => {
  const { moduleId, actionName } = req.params;
  const { status } = req.body;

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const mod = await Module.findOneAndUpdate(
    {
      _id: moduleId,
      'actions.name': actionName.toUpperCase()
    },
    { $set: { 'actions.$.status': status } },
    { new: true }
  );

  if (!mod) {
    return res.status(404).json({ message: 'Module or Action not found' });
  }

  res.json(mod);
};

/**
 * Deactivate Module
 */
exports.deactivateModule = async (req, res) => {
  const { id } = req.params;

  const mod = await Module.findByIdAndUpdate(
    id,
    { status: 'INACTIVE' },
    { new: true }
  );

  if (!mod) return res.status(404).json({ message: 'Module not found' });

  res.json(mod);
};
