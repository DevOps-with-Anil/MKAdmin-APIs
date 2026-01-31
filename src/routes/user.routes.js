const router = require('express').Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenantMiddleware');
const ctrl = require('../controllers/user.controller');


router.use(auth, tenant);
router.post('/', ctrl.createUser);
router.get('/', ctrl.getUsers);


module.exports = router;