
/**
 * @file Auth Middleware
 * @description Verifies JWT token, loads full user + role,
 *              validates account + role status, and injects user context.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/rbac/RootAdmin');
const UserAdmin = require('../models/affiliates/rbac/TenantAdmin');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');
const JWT_SECRET  =  process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    // ========================================
    // 1️⃣ Extract Authorization header
    // ========================================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_MISSING);
    }

    // ========================================
    // 2️⃣ Verify JWT
    // ========================================
    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_INVALID);
    }

    // ========================================
    // 3️⃣ Load user with role
    // ========================================
    let user;

    if (decoded.roleType === 'ROOT') {
      user = await User.findById(decoded._id).populate('role');
    } else if (decoded.roleType === 'TENANT') {
      user = await UserAdmin.findById(decoded._id).populate('role');
    }

    if (!user) {
      return responseFormatter.error(req, res, 401, MSG.USER_NOT_FOUND);
    }

    // ========================================
    // 4️⃣ Validate user status
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
    // 5️⃣ Validate role (NEW 🔥)
    // ========================================
    if (!user.role) {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.AUTH_ROLE_NOT_FOUND
      );
    }

    // Role status check
    if (user.role.status !== 'ACTIVE') {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.ROLE_NOT_FOUND
      );
    }

    // Role availability check (if you use isAvailable flag)
    if (user.role.isAvailable === false) {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.AUTH_ROLE_NOT_AVAILABLE
      );
    }

    // ========================================
    // 6️⃣ Attach user to request
    // ========================================
    req.user = user;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);

    return responseFormatter.error(
      req,
      res,
      401,
      MSG.AUTH_TOKEN_INVALID
    );
  }
};