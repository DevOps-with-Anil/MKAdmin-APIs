/**
 * ============================================================
 * @file Auth Controller
 * @description Handles authentication, login tracking,
 * device tracking, JWT generation, and session management.
 * ============================================================
 */

const jwt = require("jsonwebtoken");
const UAParser = require("ua-parser-js");
const path = require("path");
const fs = require("fs");

const User = require("../../models/rbac/RootAdmin");
const UserAdmin = require("../../models/affiliates/rbac/TenantAdmin");

const responseFormatter = require("../../utils/responseFormatter");
const auditLogger = require("../../utils/auditLogger");

const MSG = require("../../config/constants/messageKeys");
const CODES = require("../../config/constants/errorCodes");

const JWT_SECRET = process.env.JWT_SECRET



const {
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidPassword
} = require("../../utils/validator");

const { DEFAULT_LANG } = require("../../utils/i18n");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";



/**
 * ============================================================
 * 🔐 ROOT LOGIN
 * @route   POST /auth/login
 * @desc    Authenticate root user and issue JWT
 * @access  Public
 * ============================================================
 */
exports.rootlogin = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;
    const { email, password } = req.body;

    /**
     * =========================================
     * 1️⃣ Fetch user
     * =========================================
     */
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    })
      .select("+password")
      .populate("role");

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_INVALID_CREDENTIALS,
        CODES.USR_401
      );
    }

    /**
     * =========================================
     * 2️⃣ Check account status
     * =========================================
     */
    if (user.status !== "ACTIVE") {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.AUTH_ACCOUNT_INACTIVE,
        CODES.USR_403
      );
    }

    /**
     * =========================================
     * 3️⃣ Validate password
     * =========================================
     */
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

    /**
     * =========================================
     * 4️⃣ Parse device information
     * =========================================
     */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const deviceInfo = {
      ipAddress,
      userAgent: req.headers["user-agent"],
      deviceType: ua.device.type || "desktop",
      os: ua.os.name,
      browser: ua.browser.name,
      lastUsedAt: new Date()
    };

    /**
     * =========================================
     * 5️⃣ Update login tracking
     * =========================================
     */
    user.lastLoginAt = new Date();
    user.currentDevice = deviceInfo;

    user.loginHistory.unshift({
      ...deviceInfo,
      loggedInAt: new Date()
    });

    user.loginHistory = user.loginHistory.slice(0, 20);

    /**
     * =========================================
     * 6️⃣ Generate JWT
     * =========================================
     */

    // console.log(JSON.stringify(user))

    const tokenPayload = {
      _id: user._id,
      email: user.email,
      roleId: user.role._id,
      roleType: user.userType
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    /**
     * =========================================
     * 7️⃣ Store active session token
     * =========================================
     */
    user.tokens.unshift({
      token,
      ipAddress,
      userAgent: req.headers["user-agent"]
    });

    user.tokens = user.tokens.slice(0, 1);

    await user.save();

    /**
     * =========================================
     * 8️⃣ Send response
     * =========================================
     */
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
            _id: user.role._id,
            name:
              user.role.name?.[lang] ||
              user.role.name?.[DEFAULT_LANG],
            permissions: user.role.permissions
          },
          userType: user.userType,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          currentDevice: user.currentDevice
        }
      },
      "",
      200
    );

  } catch (err) {

    console.error("Login error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.AUTH_LOGIN_FAILED,
      CODES.USR_500
    );
  }
};


/**
 * ============================================================
 * 👤 GET MY PROFILE
 * @route   GET /users/me
 * @desc    Get logged-in user profile
 * @access  Private
 * ============================================================
 */
exports.getMyProfile = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;
    // const user = req.user;

    /**
   * =========================================
   * 1️⃣ Fetch user
   * =========================================
   */
    const user = await User.findById(req.user)
      .populate('role');

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    /**
     * Build safe profile object
     */
    const profileResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneCode: user.phoneCode,
      phoneNumber: user.phoneNumber || null,
      photo: user.photo || null,

      role: {
        _id: user.role._id,
        name:
          user.role.name?.[lang] ||
          user.role.name?.[DEFAULT_LANG],
        permissions: user.role.permissions
      },

      allowedCountries: user.allowedCountries || [],
      status: user.status || "INACTIVE",

      lastLoginAt: user.lastLoginAt
    };

    return responseFormatter.success(
      req,
      res,
      MSG.USER_PROFILE_FETCHED,
      profileResponse,
      {},
      200
    );

  } catch (error) {

    console.error("Get profile error:", error);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.SERVER_ERROR,
      CODES.USR_500
    );
  }
};


/**
 * ============================================================
 * ✏️ UPDATE MY PROFILE
 * @route   PUT /users/me
 * @desc    Update logged-in user profile
 * @access  Private
 * ============================================================
 */

exports.updateMyProfile = async (req, res) => {
  try {

    const {
      name,
      email,
      phoneNumber,
      phoneCode
    } = req.body;

    const file = req.file;

    const userId = req.user._id;

    /**
     * =========================================
     * 1️⃣ Fetch user
     * =========================================
     */
    const user = await User.findById(userId);

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    const before = { ...user.toObject() };

    /**
     * =========================================
     * 2️⃣ Validation
     * =========================================
     */
    if (name && !isValidName(name.trim())) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.INVALID_NAME,
        CODES.USR_400
      );
    }

    if (email && !isValidEmail(email.trim())) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.INVALID_EMAIL,
        CODES.USR_400
      );
    }

    if (phoneNumber && !isValidPhone(phoneNumber.trim())) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.INVALID_PHONE,
        CODES.USR_400
      );
    }

    /**
     * =========================================
     * 3️⃣ Duplicate email check
     * =========================================
     */
    if (
      email &&
      email.toLowerCase().trim() !== user.email
    ) {

      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return responseFormatter.error(
          req,
          res,
          409,
          MSG.EMAIL_ALREADY_EXISTS,
          CODES.USR_409
        );
      }

      user.email = email.toLowerCase().trim();
    }

    /**
     * =========================================
     * 4️⃣ Duplicate phone check
     * =========================================
     */
    if (
      phoneNumber &&
      phoneNumber !== user.phoneNumber
    ) {

      const existingPhoneUser = await User.findOne({
        phoneNumber,
        _id: { $ne: user._id }
      });

      if (existingPhoneUser) {
        return responseFormatter.error(
          req,
          res,
          409,
          MSG.PHONE_ALREADY_EXISTS,
          CODES.USR_409
        );
      }
    }

    /**
     * =========================================
     * 5️⃣ Update fields
     * =========================================
     */
    if (name) {
      user.name = name.trim();
    }

    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber.trim();
    }

    if (phoneCode !== undefined) {
      user.phoneCode = phoneCode.trim();
    }

    /**
     * =========================================
     * 6️⃣ Handle profile photo upload
     * =========================================
     */
    if (file) {

      /**
       * Delete old image
       */
      if (user.photo) {

        try {

          const oldPath = user.photo.split(req.get("host"))[1];

          if (oldPath) {

            const fullPath = path.join(
              process.cwd(),
              oldPath
            );

            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }

        } catch (deleteError) {
          console.error(
            "Old image delete failed:",
            deleteError
          );
        }
      }

      /**
       * Save new image URL
       */
      const baseUrl =
        `${req.protocol}://${req.get("host")}`;

      const photoUrl =
        `${baseUrl}/${file.path.replace(/\\/g, "/")}`;

      user.photo = photoUrl;
    }

    await user.save();

    const after = { ...user.toObject() };

    /**
     * =========================================
     * 7️⃣ Audit log
     * =========================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "UPDATE_PROFILE",
      module: "USER",
      entityId: user._id,
      entityName: user.email,
      before,
      after,
      message: req.t(MSG.USER_PROFILE_UPDATED)
    });

    /**
     * =========================================
     * 8️⃣ Response
     * =========================================
     */
    return responseFormatter.success(
      req,
      res,
      MSG.USER_UPDATED,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneCode: user.phoneCode,
        phoneNumber: user.phoneNumber,
        photo: user.photo
      },
      {},
      200
    );

  } catch (error) {

    console.error(
      "Update profile error:",
      error
    );

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.SERVER_ERROR,
      CODES.USR_500
    );
  }
};


/**
 * ============================================================
 * 🔑 CHANGE MY PASSWORD
 * @route   POST /auth/change-password
 * @desc    Change logged-in user's password
 * @access  Private
 * ============================================================
 */
exports.changeMyPassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    /**
     * Validate payload
     */
    if (!currentPassword || !newPassword) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.PASSWORD_REQUIRED,
        CODES.USR_400
      );
    }

    /**
     * Fetch user
     */
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    /**
     * Verify current password
     */
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.PASSWORD_CURRENT_INVALID,
        CODES.USR_401
      );
    }

    /**
     * Validate new password
     */
    if (!isValidPassword(newPassword)) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.PASSWORD_TOO_WEAK,
        CODES.USR_400
      );
    }

    /**
     * Update password
     */
    user.password = newPassword;

    /**
     * Logout from all sessions
     */
    user.tokens = [];

    await user.save();

    /**
     * Audit log
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "CHANGE_PASSWORD",
      module: "AUTH",
      entityId: user._id,
      entityName: user.email,
      before: null,
      after: null,
      message: req.t(MSG.USER_PASSWORD_CHANGED)
    });

    /**
     * Response
     */
    return responseFormatter.success(
      req,
      res,
      MSG.USER_PASSWORD_CHANGED,
      null,
      null,
      200
    );

  } catch (err) {

    console.error("Change password error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.PASSWORD_CHANGE_FAILED,
      CODES.USR_500
    );
  }
};




/**
 * ============================================================
 * 🔐 TENANT ADMIN LOGIN
 * @route   POST /auth/login
 * @desc    Authenticate tenant user and issue JWT
 * @access  Public
 * ============================================================
 */
exports.adminlogin = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;
    const { email, password } = req.body;

    /**
     * =========================================
     * 1️⃣ Fetch user
     * =========================================
     */
    const user = await UserAdmin.findOne({
      email: email.toLowerCase().trim()
    })
      .select("+password")
      .populate("role");

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.AUTH_INVALID_CREDENTIALS,
        CODES.USR_401
      );
    }

    /**
     * =========================================
     * 2️⃣ Check account status
     * =========================================
     */
    if (user.status !== "ACTIVE") {
      return responseFormatter.error(
        req,
        res,
        403,
        MSG.AUTH_ACCOUNT_INACTIVE,
        CODES.USR_403
      );
    }

    /**
     * =========================================
     * 3️⃣ Validate password
     * =========================================
     */
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

    /**
     * =========================================
     * 4️⃣ Parse device information
     * =========================================
     */
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const deviceInfo = {
      ipAddress,
      userAgent: req.headers["user-agent"],
      deviceType: ua.device.type || "desktop",
      os: ua.os.name,
      browser: ua.browser.name,
      lastUsedAt: new Date()
    };

    /**
     * =========================================
     * 5️⃣ Update login tracking
     * =========================================
     */
    user.lastLoginAt = new Date();
    user.currentDevice = deviceInfo;

    user.loginHistory.unshift({
      ...deviceInfo,
      loggedInAt: new Date()
    });

    user.loginHistory = user.loginHistory.slice(0, 20);

    /**
     * =========================================
     * 6️⃣ Generate JWT
     * =========================================
     */
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      roleId: user.role._id,
      roleType: user.userType
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    /**
     * =========================================
     * 7️⃣ Store active session token
     * =========================================
     */
    user.tokens.unshift({
      token,
      ipAddress,
      userAgent: req.headers["user-agent"]
    });

    user.tokens = user.tokens.slice(0, 1);

    await user.save();

    /**
     * =========================================
     * 8️⃣ Send response
     * =========================================
     */
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
            _id: user.role._id,
            name:
              user.role.name?.[lang] ||
              user.role.name?.[DEFAULT_LANG],
            permissions: user.role.permissions
          },
          userType: user.userType,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          currentDevice: user.currentDevice
        }
      },
      "",
      200
    );


  } catch (err) {

    console.error("Login error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.AUTH_LOGIN_FAILED,
      CODES.USR_500
    );
  }
};



/**
 * ============================================================
 * 👤 GET MY PROFILE -  Tenant Admin
 * @route   GET /users/me
 * @desc    Get logged-in user profile
 * @access  Private
 * ============================================================
 */
exports.getMyProfileAdmin = async (req, res) => {
  try {

    const lang = req.lang || DEFAULT_LANG;


    /**
   * =========================================
   * 1️⃣ Fetch user
   * =========================================
   */
    const user = await UserAdmin.findById(req.user)
      .populate('role');;

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    /**
     * Build safe profile object
     */
    const profileResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneCode: user.phoneCode,
      phoneNumber: user.phoneNumber || null,
      photo: user.photo || null,

      role: user.role
        ? {
          id: user.role._id,
          name:
            user.role.name?.[lang] ||
            user.role.name?.[DEFAULT_LANG],
          permissions: user.role.permissions
        }
        : null,

      allowedCountries: user.allowedCountries || [],
      status: user.status || "INACTIVE",

      lastLoginAt: user.lastLoginAt
    };

    return responseFormatter.success(
      req,
      res,
      MSG.USER_PROFILE_FETCHED,
      profileResponse,
      {},
      200
    );

  } catch (error) {

    console.error("Get profile error:", error);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.SERVER_ERROR,
      CODES.USR_500
    );
  }
};


/**
 * ============================================================
 * ✏️ UPDATE MY PROFILE
 * @route   PUT /users/me
 * @desc    Update logged-in user profile
 * @access  Private
 * ============================================================
 */
exports.updateMyProfileAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, phoneCode, photo } = req.body;
    const userId = req.user._id;

    /**
     * =========================================
     * 1️⃣ Fetch user
     * =========================================
     */
    const user = await UserAdmin.findById(userId);

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    const before = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      photo: user.photo
    };

    /**
     * =========================================
     * 2️⃣ Validate fields
     * =========================================
     */
    if (name && !isValidName(name)) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.INVALID_NAME,
        CODES.USR_400
      );
    }

    if (email && !isValidEmail(email)) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.INVALID_EMAIL,
        CODES.USR_400
      );
    }

    if (phoneNumber && !isValidPhone(phoneNumber)) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.INVALID_PHONE,
        CODES.USR_400
      );
    }

    /**
     * =========================================
     * 3️⃣ Check duplicate email within tenant
     * =========================================
     */
    if (email && email.toLowerCase() !== user.email) {
      const existingEmailUser = await UserAdmin.findOne({
        email: email.toLowerCase(),
        tenantId: user.tenantId,
        _id: { $ne: user._id }
      });

      if (existingEmailUser) {
        return responseFormatter.error(
          req,
          res,
          409,
          MSG.EMAIL_ALREADY_EXISTS,
          CODES.USR_409
        );
      }

      user.email = email.toLowerCase().trim();
    }

    /**
     * =========================================
     * 4️⃣ Check duplicate phoneNumber within tenant
     * =========================================
     */
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhoneUser = await UserAdmin.findOne({
        phoneNumber: phoneNumber,
        tenantId: user.tenantId,
        _id: { $ne: user._id }
      });

      if (existingPhoneUser) {
        return responseFormatter.error(
          req,
          res,
          409,
          MSG.PHONE_ALREADY_EXISTS,
          CODES.USR_409
        );
      }

      user.phoneNumber = phoneNumber;
      if (phoneCode) user.phoneCode = phoneCode; // optional update
    }

    /**
     * =========================================
     * 5️⃣ Update other fields (partial update)
     * =========================================
     */
    if (name) user.name = name;
    if (photo) user.photo = photo;

    await user.save();

    const after = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      photo: user.photo
    };

    /**
     * =========================================
     * 6️⃣ Audit log
     * =========================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "UPDATE_PROFILE",
      module: "USER",
      entityId: user._id,
      entityName: user.email,
      before,
      after,
      message: req.t(MSG.USER_PROFILE_UPDATED)
    });

    /**
     * =========================================
     * 7️⃣ Response
     * =========================================
     */
    return responseFormatter.success(
      req,
      res,
      MSG.USER_UPDATED,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneCode: user.phoneCode,
        phoneNumber: user.phoneNumber,
        photo: user.photo
      },
      {},
      201
    );

  } catch (error) {
    console.error("Update profile error:", error);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.SERVER_ERROR,
      CODES.USR_500
    );
  }
};

/**
 * ============================================================
 * 🔑 CHANGE MY PASSWORD
 * @route   POST /auth/change-password
 * @desc    Change logged-in user's password
 * @access  Private
 * ============================================================
 */
exports.changeMyPasswordAdmin = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    /**
     * Validate payload
     */
    if (!currentPassword || !newPassword) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.PASSWORD_REQUIRED,
        CODES.USR_400
      );
    }

    /**
     * Fetch user
     */
    const user = await UserAdmin.findById(req.user._id).select("+password");

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    /**
     * Verify current password
     */
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return responseFormatter.error(
        req,
        res,
        401,
        MSG.PASSWORD_CURRENT_INVALID,
        CODES.USR_401
      );
    }

    /**
     * Validate new password
     */
    if (!isValidPassword(newPassword)) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.PASSWORD_TOO_WEAK,
        CODES.USR_400
      );
    }

    /**
     * Update password
     */
    user.password = newPassword;

    /**
     * Logout from all sessions
     */
    user.tokens = [];

    await user.save();

    /**
     * Audit log
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: "CHANGE_PASSWORD",
      module: "AUTH",
      entityId: user._id,
      entityName: user.email,
      before: null,
      after: null,
      message: req.t(MSG.USER_PASSWORD_CHANGED)
    });

    /**
     * Response
     */
    return responseFormatter.success(
      req,
      res,
      MSG.USER_PASSWORD_CHANGED,
      null,
      null,
      201
    );

  } catch (err) {

    console.error("Change password error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.PASSWORD_CHANGE_FAILED,
      CODES.USR_500
    );
  }
};