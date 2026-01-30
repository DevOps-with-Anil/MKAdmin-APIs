const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');


exports.login = async (req, res) => {
const { email, password } = req.body;
const user = await User.findOne({ email }).populate('role');
if (!user) return res.status(400).json({ message: 'User not found' });


const isMatch = await user.comparePassword(password);
if (!isMatch) return res.status(400).json({ message: 'Invalid password' });


const token = jwt.sign({
id: user._id,
tenant: user.tenant,
role: user.role.name
}, JWT_SECRET, { expiresIn: '1d' });


res.json({ token, user });
};