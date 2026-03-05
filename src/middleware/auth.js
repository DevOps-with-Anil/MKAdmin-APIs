// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = require('../config/env');
// const User = require('../models/User');


// module.exports = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const token = authHeader.split(' ')[1];

//     const decoded = jwt.verify(token, JWT_SECRET);

//     // 🔥 LOAD FULL USER + ROLE
//     const user = await User.findById(decoded._id)
//       .populate('role');

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     if (user.status !== 'ACTIVE') {
//       return res.status(403).json({ message: 'User is inactive' });
//     }

//     req.user = user; // FULL USER OBJECT
//     next();
//   } catch (err) {
//     console.error('Auth error:', err);
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };


/**
 * @file Auth Middleware
 * @description Verifies JWT token, loads full user + role,
 *              validates account status, and injects user
 *              context into the request.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/platform/User');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');


/**
 * @middleware authenticate
 * @desc       Protect routes by validating JWT and loading user context
 * @access     Private
 */
module.exports = async (req, res, next) => {
  try {
    // ========================================
    // 1️⃣ Extract Authorization header
    // ========================================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_TOKEN_MISSING
      );
    }

    // ========================================
    // 2️⃣ Extract & verify JWT token
    // ========================================
    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_TOKEN_INVALID
      );
    }

    // ========================================
    // 3️⃣ Load full user + role from database
    // - Always trust DB over token snapshot
    // ========================================
    const user = await User.findById(decoded._id)
      .populate('role');

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.USER_NOT_FOUND
      );
    }

    // ========================================
    // 4️⃣ Validate account status
    // ========================================
    if (user.status !== 'ACTIVE') {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.AUTH_ACCOUNT_INACTIVE
      );
    }

    // ========================================
    // 5️⃣ Inject user context into request
    // - Downstream controllers can rely on req.user
    // ========================================
    req.user = user;

    next();

  } catch (err) {
    // ========================================
    // Global authentication error handler
    // ========================================
    console.error('Auth middleware error:', err);

    return responseFormatter.error(
      req,
      res,
      401,
      MSG.AUTH_TOKEN_INVALID
    );
  }
};
