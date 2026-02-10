/**
 * @file User Profile Controller
 * @description Handles retrieval of the currently authenticated user's profile.
 *              Returns safe user data for frontend consumption.
 */

const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');


/**
 * @route   GET /users/me
 * @desc    Get logged-in user profile
 * @access  Private (JWT Protected)
 */
exports.getMyProfile = async (req, res) => {
  try {
    // ========================================
    // 1️⃣ Extract authenticated user
    // - req.user is injected by auth middleware
    // ========================================
    const user = req.user;

    // Safety check (should not happen if auth middleware works correctly)
    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND
      );
    }

    // ========================================
    // 2️⃣ Build safe profile response object
    // - Never expose sensitive fields
    // - Normalize optional fields to null/empty
    // ========================================
    const profileResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      photo: user.photo || null,

      // Role & RBAC info (if role is populated)
      role: user.role
        ? {
            id: user.role._id,
            name: user.role.name,
            permissions: user.role.permissions
          }
        : null,

      // Country & access restrictions
      allowedCountries: user.allowedCountries || [],

      // Account lifecycle status
      status: user.status || 'INACTIVE',

      // Last successful login timestamp
      lastLoginAt: user.lastLoginAt,

      // ========================================
      // Device & environment tracking (if stored)
      // Useful for security UI & audits
      // ========================================
      tracking: {
        lastIp: user.lastIp || null,
        lastBrowser: user.lastBrowser || null,
        lastDevice: user.lastDevice || null,
        lastOs: user.lastOs || null
      },

      // Audit fields
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // ========================================
    // 3️⃣ Send successful response
    // ========================================
    return responseFormatter.success(
      req,
      res,
      MSG.USER_PROFILE_FETCHED,
      profileResponse,
      {},
      201
    );

  } catch (error) {
    // ========================================
    // Global error handler
    // - Logs internal error
    // - Returns generic server error to client
    // ========================================
    console.error('Get profile error:', error);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.SERVER_ERROR
    );
  }
};
