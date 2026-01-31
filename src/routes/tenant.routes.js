const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/tenant.controller');


router.use(auth);
router.post('/', ctrl.createTenant);
router.get('/', ctrl.getTenants);


module.exports = router;