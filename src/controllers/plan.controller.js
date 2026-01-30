const Plan = require('../models/Plan');


exports.createPlan = async (req, res) => {
const plan = await Plan.create(req.body);
res.json(plan);
};


exports.getPlans = async (req, res) => {
const plans = await Plan.find();
res.json(plans);
};