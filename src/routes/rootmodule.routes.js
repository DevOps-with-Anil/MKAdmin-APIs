const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/rootmodule.controller');

// Protect system catalog
router.use(auth);

// Modules
router.post('/', ctrl.createModule);
router.get('/', ctrl.getModules);
router.patch('/:id/status', ctrl.updateModuleStatus);
router.patch('/:id/deactivate', ctrl.deactivateModule);

// Actions
router.post('/:id/actions', ctrl.addActions);
router.put('/:id/actions', ctrl.replaceActions);
router.patch('/:moduleId/actions/:actionName/status', ctrl.updateActionStatus);

module.exports = router;
