/**
 * @file Auth Controller
 * @description Handles authentication, login tracking, device tracking,
 *              JWT generation, and session management.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UAParser = require('ua-parser-js');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');
const { JWT_SECRET } = require('../config/env');
const CODES = require('../config/constants/errorCodes');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';


/**
 * @route   POST /auth/login
 * @desc    Authenticate user and issue JWT token
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ========================================
    // 0️⃣ Explicit Connection Check
    // - Verify database is connected before query
    // ========================================
    const { rootDB } = require('../config/db');
    if (rootDB.readyState !== 1) {
      console.error('❌ Database not connected. State:', rootDB.readyState);
      return responseFormatter.error(
        req,
        res,
        503,
        MSG.SERVER_DATABASE_UNAVAILABLE || 'Database connection unavailable'
      );
    }

    // ========================================
    // 1️⃣ Fetch user by email (include password)
    // - Normalize email to avoid case/space issues
    // - Populate role for RBAC & permissions
    // ========================================
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('role');

    // User not found → invalid credentials
    if (!user) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_INVALID_CREDENTIALS,
        "PWD_403"
      );
    }

    // ========================================
    // 1.5️⃣ Fallback for missing role
    // - Handle cases where role is null/undefined
    // - Provide default role to prevent crashes
    // ========================================
    const defaultRole = {
      _id: null,
      name: 'UNASSIGNED',
      permissions: []
    };
    
    const userRole = user.role || defaultRole;

    // ========================================
    // 2️⃣ Validate account status
    // - Block login for inactive/suspended users
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
    // 3️⃣ Verify password
    // - Uses bcrypt (or equivalent) via model method
    // ========================================
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_INVALID_CREDENTIALS,
        CODES.VALIDATION_INVALID_PASSWORD
      );
    }

    // ========================================
    // 4️⃣ Parse device & environment info
    // - Used for audit, security & session tracking
    // ========================================
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();

    // Resolve client IP (supports proxies/load balancers)
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

    // ========================================
    // 5️⃣ Update login tracking & audit info
    // - last login time
    // - current device snapshot
    // - login history (limited to last 20)
    // ========================================
    user.lastLoginAt = new Date();
    user.currentDevice = deviceInfo;

    user.loginHistory.unshift({
      ...deviceInfo,
      loggedInAt: new Date()
    });

    // Keep only last 20 login records
    user.loginHistory = user.loginHistory.slice(0, 20);

    // ========================================
    // 6️⃣ Build JWT payload
    // - Includes role & permissions for RBAC
    // - Keep payload minimal but useful
    // - Uses fallback role if missing
    // ========================================
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      roleId: userRole._id,
      roleName: userRole.name,
      permissions: userRole.permissions
    };

    // Generate signed JWT token
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // ========================================
    // 7️⃣ Optional: Store active tokens (session tracking)
    // - Useful for:
    //   • Force logout
    //   • Device/session management
    //   • Security audits
    // ========================================
    user.tokens.unshift({
      token,
      ipAddress,
      userAgent: req.headers['user-agent']
    });

    // Keep only last 10 active tokens
    user.tokens = user.tokens.slice(0, 10);

    // Persist all changes
    await user.save();

    // ========================================
    // 8️⃣ Send success response
    // - Return token + safe user profile
    // - Do NOT expose sensitive fields
    // ========================================
    return responseFormatter.success(
      req,
      res,
      MSG.AUTH_LOGIN_SUCCESS,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: {
            _id: userRole._id,
            name: userRole.name,
            permissions: userRole.permissions
          },
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          currentDevice: user.currentDevice
        }
      },
      '',
      201
    );

  } catch (err) {
    // ========================================
    // Global error handler for login
    // - Prevents leaking internal errors
    // - Logs full error for debugging
    // ========================================
    console.error('Login error:', err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.AUTH_LOGIN_FAILED
    );
  }
};

