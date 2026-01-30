const User = require('../models/User');


exports.createUser = async (req, res) => {
const user = await User.create({
...req.body,
tenant: req.tenantId
});
res.json(user);
};


exports.getUsers = async (req, res) => {
const users = await User.find({ tenant: req.tenantId });
res.json(users);
};