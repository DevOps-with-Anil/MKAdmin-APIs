// const jwt = require('jsonwebtoken');
// const User = require('../models/rbac/RootAdmin');
// const UserAdmin = require('../models/affiliates/rbac/TenantAdmin');
// const responseFormatter = require('../utils/responseFormatter');
// const MSG = require('../config/constants/messageKeys');
// const responseCode = require('../config/constants/errorCodes');
// const JWT_SECRET = process.env.JWT_SECRET


// module.exports = async (req, res, next) => {
//   try {

//     /* ========================================
//        1️⃣ SESSION CHECK (WEB)
//     ======================================== */
//     if (req.session?.user) {
//       const sessionUser = req.session.user;
//       let user;
//       if (sessionUser.roleType === "ROOT") {
//         user = await User.findById(sessionUser._id).populate("role");
//       } else {
//         user = await UserAdmin.findById(sessionUser._id).populate("role");
//       }
//       if (!user) {
//         return responseFormatter.error(req, res, 401, MSG.USER_NOT_FOUND);
//       }
//       req.user = user;
//       return next();
//     }else{
      
//         return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_EXPIRED);
      
//     }

//     /* ========================================
//        2️⃣ JWT CHECK (MOBILE/API)
//     ======================================== */

//     // const authHeader = req.headers.authorization;
//     // if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     //   return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_MISSING);
//     // }
//     // const token = authHeader.split(" ")[1];
//     // let decoded;
//     // try {
//     //   decoded = jwt.verify(token, JWT_SECRET);
//     // } catch (err) {
//     //   return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_INVALID);
//     // }
//     // const userId = decoded._id;
//     // let user;
//     // if (decoded.roleType === "ROOT") {
//     //   user = await User.findById(userId).populate("role");
//     // } else {
//     //   user = await UserAdmin.findById(userId).populate("role");
//     // }
//     // if (!user) {
//     //   return responseFormatter.error(req, res, 401, MSG.USER_NOT_FOUND);
//     // }
//     // req.user = user;
//     // return next();



//   } catch (err) {
//     console.error("Auth middleware error:", err);

//     return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_INVALID);
//   }
// };


const jwt = require("jsonwebtoken");

const User = require("../models/rbac/RootAdmin");
const UserAdmin = require("../models/affiliates/rbac/TenantAdmin");

const responseFormatter = require("../utils/responseFormatter");

const MSG = require("../config/constants/messageKeys");
const CODES = require("../config/constants/errorCodes");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    /* ========================================
       1️⃣ SESSION CHECK (WEB)
    ======================================== */
    if (req.session?.user) {
      const sessionUser = req.session.user;

      let user;

      if (sessionUser.roleType === "ROOT") {
        user = await User.findById(sessionUser._id).populate("role");
      } else {
        user = await UserAdmin.findById(sessionUser._id).populate("role");
      }

      /* ========================================
         USER NOT FOUND
      ======================================== */
      if (!user) {
        return responseFormatter.error(
          req,
          res,
          404,
          MSG.USER_NOT_FOUND,
          CODES.USER_NOT_FOUND
        );
      }

      req.user = user;

      return next();
    }

    /* ========================================
       SESSION EXPIRED
    ======================================== */
    return responseFormatter.error(
      req,
      res,
      401,
      MSG.AUTH_TOKEN_EXPIRED,
      CODES.AUTH_SESSION_EXPIRED
    );

    /* ========================================
       2️⃣ JWT CHECK (MOBILE/API)
    ======================================== */

    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return responseFormatter.error(
    //     req,
    //     res,
    //     401,
    //     MSG.AUTH_TOKEN_MISSING,
    //     CODES.AUTH_UNAUTHORIZED
    //   );
    // }

    // const token = authHeader.split(" ")[1];

    // let decoded;

    // try {
    //   decoded = jwt.verify(token, JWT_SECRET);
    // } catch (err) {
    //   return responseFormatter.error(
    //     req,
    //     res,
    //     401,
    //     MSG.AUTH_TOKEN_INVALID,
    //     CODES.AUTH_TOKEN_INVALID
    //   );
    // }

    // const userId = decoded._id;

    // let user;

    // if (decoded.roleType === "ROOT") {
    //   user = await User.findById(userId).populate("role");
    // } else {
    //   user = await UserAdmin.findById(userId).populate("role");
    // }

    // if (!user) {
    //   return responseFormatter.error(
    //     req,
    //     res,
    //     404,
    //     MSG.USER_NOT_FOUND,
    //     CODES.USER_NOT_FOUND
    //   );
    // }

    // req.user = user;

    // return next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.AUTH_TOKEN_INVALID,
      CODES.INTERNAL_SERVER_ERROR
    );
  }
};