const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const tenant = require('../middlewares/tenantMiddleware');
const ctrl = require('../controllers/user.controller');


router.use(auth, tenant);
router.post('/', ctrl.createUser);
router.get('/', ctrl.getUsers);


module.exports = router;