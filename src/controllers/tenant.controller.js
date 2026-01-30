const Tenant = require('../models/Tenant');


exports.createTenant = async (req, res) => {
const tenant = await Tenant.create(req.body);
res.json(tenant);
};


exports.getTenants = async (req, res) => {
const tenants = await Tenant.find();
res.json(tenants);
};