// /**
//  * @file Auth Middleware
//  * @description Verifies JWT token, loads full user + role,
//  *              validates account status, and injects user
//  *              context into the request.
//  */

// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = require('../config/env');
// const User = require('../models/rbac/RootAdmin');
// const UserAdmin = require('../models/affiliates/rbac/TenantAdmin');
// const responseFormatter = require('../utils/responseFormatter');
// const MSG = require('../config/constants/messageKeys');


// /**
//  * @middleware authenticate
//  * @desc       Protect routes by validating JWT and loading user context
//  * @access     Private
//  */
// module.exports = async (req, res, next) => {
//   try {
//     // ========================================
//     // 1️⃣ Extract Authorization header
//     // ========================================
//     const authHeader = req.headers.authorization;

//     // console.log("authHeader is :  " + authHeader)

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return responseFormatter.error(
//         req,
//         res,
//         401,
//         MSG.AUTH_TOKEN_MISSING
//       );
//     }

//     // ========================================
//     // 2️⃣ Extract & verify JWT token
//     // ========================================
//     const token = authHeader.split(' ')[1];

//     let decoded;
//     try {
//       decoded = jwt.verify(token, JWT_SECRET);
//     } catch (jwtError) {
//       return responseFormatter.error(
//         req,
//         res,
//         401,
//         MSG.AUTH_TOKEN_INVALID
//       );
//     }

//     // ========================================
//     // 3️⃣ Load full user + role from database
//     // - Always trust DB over token snapshot
//     // ========================================

//     let user;

//     if (decoded.roleType === 'ROOT') {
//       // Fetch from the ROOT collection
//       user = await User.findById(decoded._id)
//         .populate('role'); // populate role if needed
//     } else if (decoded.roleType === 'TENANT') {
//       // Fetch from the Tenant collection
//       user = await UserAdmin.findById(decoded._id)
//         .populate('role');
//     } else {
//       // Default: fetch from normal User collection
//       // user = await User.findById(decoded._id)
//       //   .populate('role');
//     }

//     if (!user) {
//       return responseFormatter.error(
//         req,
//         res,
//         401,
//         MSG.USER_NOT_FOUND
//       );
//     }

//     // ========================================
//     // 4️⃣ Validate account status
//     // ========================================
//     if (user.status !== 'ACTIVE') {
//       return responseFormatter.error(
//         req,
//         res,
//         403,
//         MSG.AUTH_ACCOUNT_INACTIVE
//       );
//     }

//     // ========================================
//     // 5️⃣ Inject user context into request
//     // - Downstream controllers can rely on req.user
//     // ========================================
//     req.user = user;

//     next();

//   } catch (err) {
//     // ========================================
//     // Global authentication error handler
//     // ========================================
//     console.error('Auth middleware error:', err);

//     return responseFormatter.error(
//       req,
//       res,
//       401,
//       MSG.AUTH_TOKEN_INVALID
//     );
//   }
// };



/**
 * @file Auth Middleware
 * @description Verifies JWT token, loads full user + role,
 *              validates account + role status, and injects user context.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/rbac/RootAdmin');
const UserAdmin = require('../models/affiliates/rbac/TenantAdmin');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');

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