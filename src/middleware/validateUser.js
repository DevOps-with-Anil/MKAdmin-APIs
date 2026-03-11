// middleware/validateUser.js
const User = require('../models/rbac/RootAdmin');
const UserTenant = require('../models/affiliates/rbac/TenantAdmin');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');
const CODES = require('../config/constants/errorCodes');

/**
 * Middleware: Validate that the logged-in user exists
 * and attach full user object to req.user
 */
module.exports = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_TOKEN_INVALID,
        CODES.USR_401
      );
    }


    // console.log(req.user?.userType);

     let user;
    
        if (req.user?.userType === 'ROOT') {
          // Fetch from the ROOT collection
          user = await User.findById(req.user._id);
           
        } else if (req.user?.userType === 'TENANT') {
          // Fetch from the Tenant collection
          user = await User.findById(req.user._id);
           
        } else {
          // Default: fetch from normal User collection
          // user = await User.findById(decoded._id)
          //   .populate('role');
        }

    // const user = await User.findById(req.user._id);

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    // Attach full user to request
    req.user = user;

    next();
  } catch (err) {
    console.error('validateUser middleware error:', err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_VALIDATE_FAILED,
      CODES.USR_500
    );
  }
};