const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/rootmodule.controller');

// Protect system catalog
router.use(auth);

/**
 * MODULES
 */
router.post('/', ctrl.createModule);
router.get('/', ctrl.listModules);
router.put('/:id', ctrl.updateModule);
router.patch('/:id/status', ctrl.updateModuleStatus);

/**
 * ACTIONS (Embedded)
 */
router.post('/:id/actions', ctrl.addAction);
router.patch('/:id/actions/status', ctrl.updateActionStatus);
router.delete('/:id/actions', ctrl.deleteAction);

module.exports = router;
