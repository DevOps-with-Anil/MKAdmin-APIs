const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/role.controller');


router.use(auth);

// ROLES
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.put('/:id', ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);

// PERMISSIONS
router.patch('/:id/permissions', ctrl.assignPermissions);

module.exports = router;
