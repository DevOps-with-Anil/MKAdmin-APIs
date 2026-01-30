const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/plan.controller');


router.use(auth);
router.post('/', ctrl.createPlan);
router.get('/', ctrl.getPlans);


module.exports = router;