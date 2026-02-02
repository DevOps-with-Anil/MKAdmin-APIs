const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UAParser = require('ua-parser-js');


// const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const { JWT_SECRET } = require('../config/env');


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user (include password)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('role');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2️⃣ Check status
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        message: `Account is ${user.status}`
      });
    }

    // 3️⃣ Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4️⃣ Parse device info
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress;

    const deviceInfo = {
      ipAddress,
      userAgent: req.headers['user-agent'],
      deviceType: ua.device.type || 'desktop',
      os: ua.os.name,
      browser: ua.browser.name,
      lastUsedAt: new Date()
    };

    // 5️⃣ Update login tracking
    user.lastLoginAt = new Date();
    user.currentDevice = deviceInfo;

    user.loginHistory.unshift({
      ...deviceInfo,
      loggedInAt: new Date()
    });

    // limit history size
    user.loginHistory = user.loginHistory.slice(0, 20);

    // 6️⃣ Generate JWT with permissions
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      roleId: user.role._id,
      roleName: user.role.name,
      permissions: user.role.permissions
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // 7️⃣ Save token (optional session tracking)
    user.tokens.unshift({
      token,
      ipAddress,
      userAgent: req.headers['user-agent']
    });

    // limit tokens
    user.tokens = user.tokens.slice(0, 10);

    await user.save();

    // 8️⃣ Response (no password)
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: {
          _id: user.role._id,
          name: user.role.name
        },
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        currentDevice: user.currentDevice
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
