const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/User');


module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔥 LOAD FULL USER + ROLE
    const user = await User.findById(decoded._id)
      .populate('role');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'User is inactive' });
    }

    req.user = user; // FULL USER OBJECT
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
