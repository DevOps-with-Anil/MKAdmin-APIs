/**
 * ==========================================================
 * 📁 System Users Controller (Enterprise + i18n Enabled)
 * ==========================================================
 */

const User = require('../../models/rbac/RootAdmin');
const Role = require('../../models/rbac/SystemRole');
const auditLogger = require('../../utils/auditLogger');
const responseFormatter = require('../../utils/responseFormatter');
const MSG = require('../../config/constants/messageKeys');
const CODES = require('../../config/constants/errorCodes');
const path = require("path");
const fs = require("fs");
const {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidName
} = require('../../utils/validator');
const DEFAULT_LANG = 'en';

/**
 * ==========================================================
 * 🔹 Helper: Localize Role Name
 * ==========================================================
 */
const localizeUser = (user, lang = DEFAULT_LANG) => {
  const obj = user.toObject ? user.toObject() : user;

  if (obj.role && obj.role.name && typeof obj.role.name === 'object') {
    obj.role.name = obj.role.name[lang] || obj.role.name[DEFAULT_LANG];
  }

  return obj;
};

/**
 * ==========================================================
 * 🔹 Create System User
 * POST /api/systemusers
 * ==========================================================
 */
exports.createUser = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;

    const {
      name,
      email,
      phoneCode,
      phoneNumber,
      password,
      role,
      allowedCountries,
      status
    } = req.body;

    // ===== Required Validation =====
    if (!name)
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_NAME_REQUIRED, CODES.USR_400);

    if (!email)
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_EMAIL_REQUIRED, CODES.USR_400);

    if (!password)
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_PASSWORD_REQUIRED, CODES.USR_400);

    if (!role)
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_ROLE_REQUIRED, CODES.USR_400);

    if (!phoneCode)
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_PHONE_CODE_REQUIRED, CODES.USR_400);

    if (!phoneNumber)
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_PHONE_REQUIRED, CODES.USR_400);

    // ===== Format Validation =====
    if (!isValidName(name))
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_NAME, CODES.USR_400);

    if (!isValidEmail(email))
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_EMAIL, CODES.USR_400);

    if (!isValidPhone(phoneNumber))
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_PHONE, CODES.USR_400);

    if (!isValidPassword(password))
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_PASSWORD, CODES.USR_400);

    // ===== Duplicate Email =====
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return responseFormatter.error(req, res, 400, MSG.USER_EMAIL_EXISTS, CODES.USR_400);

    // ===== Role Validation =====
    const roleExists = await Role.findById(role);
    if (!roleExists)
      return responseFormatter.error(req, res, 400, MSG.USER_INVALID_ROLE, CODES.USR_400);

    // ===== Create User =====
    // const user = await User.create({
    //   name,
    //   email: email.toLowerCase(),
    //   phoneCode,
    //   phoneNumber,
    //   password,
    //   role,
    //   allowedCountries: Array.isArray(allowedCountries)
    //     ? allowedCountries.map(c => c.toUpperCase())
    //     : [],
    //   status: status || 'ACTIVE',
    //   createdBy: req.user._id
    // });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phoneCode,
      phoneNumber,
      password,
      role,

      // ✅ FIX: safe parsing for FormData + JSON
      allowedCountries: allowedCountries
        ? Array.isArray(allowedCountries)
          ? allowedCountries.map(c => c.toUpperCase())
          : JSON.parse(allowedCountries).map(c => c.toUpperCase())
        : [],

      status: status || 'ACTIVE',
      createdBy: req.user._id,

      // ✅ ADD IMAGE SUPPORT
      photo: req.file
        ? `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`
        : null
    });

    // ===== Audit =====
    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_USER',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      before: null,
      after: user,
      message: req.t(MSG.USER_CREATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.USER_CREATED,
      localizeUser(user, lang),
      null,
      201
    );


  } catch (err) {
    console.error('Create user error:', err);
    return responseFormatter.error(req, res, 500, MSG.USER_CREATE_FAILED, CODES.USR_500);
  }
};

/**
 * ==========================================================
 * 🔹 Get User List (Paginated + Filtered)
 * ==========================================================
 */
exports.getUserList = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;

    let {
      page = 1,
      limit = 10,
      search,
      status,
      roleId,
      country
    } = req.query;

    // Convert pagination safely
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    // Prevent invalid values
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status.toUpperCase();
    }

    // Role filter
    if (roleId) {
      query.role = roleId;
    }

    // Country filter (if allowedCountries is an array)
    if (country) {
      query.allowedCountries = { $in: [country.toUpperCase()] };
    }

    // Fetch users + total count
    // const [users, total] = await Promise.all([
    //   User.find(query)
    //     .populate("role", "name")
    //     .select("-password -tokens")
    //     .skip(skip)
    //     .limit(limit)
    //     .sort({ createdAt: -1 }),

    //   User.countDocuments(query)
    // ]);

    const [usersRaw, total] = await Promise.all([
      User.find(query)
        .populate({
          path: "role",
          select: "name isSystemRole",
          match: { isSystemRole: { $ne: true } }, // skiped the Root admin
        })
        .select("-password -tokens")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      User.countDocuments(query),
    ]);

    const users = usersRaw.filter(user => user.role !== null);

    const localizedUsers = users.map((u) => localizeUser(u, lang));

    return responseFormatter.success(
      req,
      res,
      MSG.USER_LIST_FETCHED,
      localizedUsers,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      },
      200
    );

  } catch (err) {
    console.error("Get user list error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_LIST_FAILED,
      CODES.USR_500
    );
  }
};

/**
 * ==========================================================
 * 🔹 Get User Detail by ID
 * ==========================================================
 */
exports.getAdminById = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;
    const userId = req.params.id;

    if (!userId) {
      return responseFormatter.error(
        req,
        res,
        400,
        "User ID is required",
        CODES.USR_400
      );
    }

    const user = await User.findById(userId)
      .populate("role", "name")
      .select("-password -tokens");

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        "User not found",
        CODES.USR_404
      );
    }

    const localizedUser = user;
    // const localizedUser = localizeUser(user, lang);

    return responseFormatter.success(
      req,
      res,
      "User fetched successfully",
      localizedUser,
      {},
      200
    );

  } catch (err) {
    console.error("Get user by ID error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_FETCH_FAILED,
      CODES.USR_500
    );
  }
};

/**
 * ==========================================================
 * 🔹 Update User
 * ==========================================================
 */
exports.updateUser = async (req, res) => {
  try {
    const lang = req.lang || DEFAULT_LANG;

    const user = await User.findById(req.params.id);

    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND,
        CODES.USR_404
      );
    }

    const before = user.toObject();

    const {
      name,
      email,
      phoneNumber,
      role,
      allowedCountries,
      status
    } = req.body;

    // ========================
    // EMAIL CHECK
    // ========================
    if (email && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });

      if (exists) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.USER_EMAIL_EXISTS,
          CODES.USR_400
        );
      }

      user.email = email.toLowerCase();
    }

    // ========================
    // ROLE VALIDATION
    // ========================
    if (role) {
      const roleExists = await Role.findById(role);

      if (!roleExists) {
        return responseFormatter.error(
          req,
          res,
          400,
          MSG.USER_INVALID_ROLE,
          CODES.USR_400
        );
      }

      user.role = role;
    }

    // ========================
    // BASIC FIELDS
    // ========================
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (status) user.status = status;

    // ========================
    // COUNTRIES (SAFE PARSE)
    // ========================
    if (allowedCountries) {
      const parsed =
        typeof allowedCountries === "string"
          ? JSON.parse(allowedCountries)
          : allowedCountries;

      user.allowedCountries = parsed.map((c) => c.toUpperCase());
    }


    // ✅ ADD IMAGE SUPPORT
    if (req.file) {
      /**
       * Delete old image
       */
      if (user.photo) {
        try {
          const oldPath = user.photo.split(req.get("host"))[1];
          console.log("OLD PATH. :  " + oldPath);
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


      user.photo = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }




    await user.save();

    const populatedUser = await user.populate("role", "name");

    await auditLogger?.({
      req,
      user: req.user,
      action: "UPDATE_USER",
      module: "USERS",
      entityId: user._id,
      entityName: user.email,
      before,
      after: user,
      message: req.t(MSG.USER_UPDATED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.USER_UPDATED,
      localizeUser(populatedUser, lang),
      null,
      201
    );

  } catch (err) {
    console.error("Update user error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_UPDATE_FAILED,
      CODES.USR_500
    );
  }
};


/**
 * ==========================================================
 * 🔹 Update User Status
 * ==========================================================
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const lang = req.language || DEFAULT_LANG;
    let { status } = req.body;

    // ✅ Strict validation: must be string 'ACTIVE' or 'INACTIVE'
    if (typeof status !== 'string' || !['ACTIVE', 'INACTIVE'].includes(status.toUpperCase())) {
      return responseFormatter.error(
        req,
        res,
        400,
        MSG.STATUS_REQUIRED
      );
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND
      );
    }

    /**
     * ======================================================
     * 1️⃣ Capture BEFORE snapshot
     * ======================================================
     */
    const beforeData = {
      status: user.status
    };

    user.status = status.toUpperCase();
    await user.save();

    /**
     * ======================================================
     * 2️⃣ Capture AFTER snapshot
     * ======================================================
     */
    const afterData = {
      status: user.status
    };

    /**
     * ======================================================
     * 3️⃣ Audit Log with Before & After
     * ======================================================
     */
    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_USER_STATUS',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      before: beforeData,
      after: afterData,
      message: MSG.USER_STATUS_UPDATED
    });

    return responseFormatter.success(
      req,
      res,
      MSG.USER_STATUS_UPDATED,
      { id: user._id, status: user.status },
      null,
      201
    );

  } catch (err) {
    console.error('Update user status error:', err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_UPDATE_FAILED
    );
  }
};

/**
 * ==========================================================
 * 🔹 Admin Reset Password
 * ==========================================================
 */
exports.adminResetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword)
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_REQUIRED, CODES.USR_400);

    if (!isValidPassword(newPassword))
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_TOO_WEAK, CODES.USR_400);

    const user = await User.findById(req.params.id).select('+password');

    if (!user)
      return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

    user.password = newPassword;
    user.tokens = [];
    await user.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'RESET_PASSWORD',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      before: null,
      after: null,
      message: req.t(MSG.USER_PASSWORD_RESET)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.USER_PASSWORD_RESET,
      null,
      null,
      200
    );

  } catch (err) {
    console.error('Reset password error:', err);
    return responseFormatter.error(req, res, 500, MSG.PASSWORD_RESET_FAILED, CODES.USR_500);
  }
};

/**
     * ======================================================
     * 2️⃣ Delete User
     * ======================================================
     */
exports.deleteUser = async (req, res) => {
  try {
    const lang = req.language || DEFAULT_LANG;

    const user = await User.findById(req.params.id);
    if (!user) {
      return responseFormatter.error(
        req,
        res,
        404,
        MSG.USER_NOT_FOUND
      );
    }

    // Optional: Prevent deleting self or super-admin
    if (user._id.equals(req.user._id)) {
      return responseFormatter.error(
        req,
        res,
        400,
        "You cannot delete your own account."
      );
    }

    const beforeData = {
      email: user.email,
      status: user.status,
      role: user.role
    };


    await user.deleteOne();


    await auditLogger?.({
      req,
      user: req.user,
      action: 'DELETE_USER',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      before: beforeData,
      after: null,
      message: MSG.USER_DELETED
    });

    return responseFormatter.success(
      req,
      res,
      MSG.USER_DELETED,
      { id: user._id },
      null,
      201
    );

  } catch (err) {
    console.error('Delete user error:', err);
    return responseFormatter.error(
      req,
      res,
      500,
      MSG.USER_DELETE_FAILED
    );
  }
};


