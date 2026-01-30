const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/role.controller');


router.use(auth);
router.post('/', ctrl.createRole);
router.get('/', ctrl.getRoles);


module.exports = router;