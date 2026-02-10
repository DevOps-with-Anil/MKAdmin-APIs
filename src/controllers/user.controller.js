// const User = require('../models/User');
// const Role = require('../models/Role');
// const auditLogger = require('../utils/auditLogger');
// const responseFormatter = require('../utils/responseFormatter');
// const MSG = require('../config/constants/messageKeys'); 
// const CODES = require('../config/constants/errorCodes');
// const { isValidEmail, isValidPhone, isValidPassword, isValidName } = require('../utils/validator');

// /**
//  * @desc    Create a new system user
//  * @route   POST /api/systemusers
//  */
// exports.createUser = async (req, res) => {
//   try {
//     const { name, email, phoneCode, phoneNumber, password, role, allowedCountries, status } = req.body;

//     // ===== VALIDATION =====
//     if (!name) return responseFormatter.error(req, res, 400, MSG.VALIDATION_NAME_REQUIRED, CODES.USR_400);
//     if (!email) return responseFormatter.error(req, res, 400, MSG.VALIDATION_EMAIL_REQUIRED, CODES.USR_400);
//     if (!password) return responseFormatter.error(req, res, 400, MSG.VALIDATION_PASSWORD_REQUIRED, CODES.USR_400);
//     if (!role) return responseFormatter.error(req, res, 400, MSG.VALIDATION_ROLE_REQUIRED, CODES.USR_400);
//     if (!phoneCode) return responseFormatter.error(req, res, 400, MSG.VALIDATION_PHONE_CODE_REQUIRED, CODES.USR_400);
//     if (!phoneNumber) return responseFormatter.error(req, res, 400, MSG.VALIDATION_PHONE_REQUIRED, CODES.USR_400);

//     if (!isValidName(name)) return responseFormatter.error(req, res, 400, MSG.VALIDATION_NAME_REQUIRED, CODES.USR_400);
//     if (!isValidEmail(email)) return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_EMAIL, CODES.USR_400);
//     if (!isValidPhone(phoneNumber)) return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_PHONE, CODES.USR_400);
//     if (!isValidPassword(password)) return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_PASSWORD, CODES.USR_400);

//     // ===== DUPLICATE EMAIL =====
//     const existing = await User.findOne({ email });
//     if (existing) return responseFormatter.error(req, res, 400, MSG.USER_EMAIL_EXISTS, CODES.USR_400);

//     // ===== ROLE VALIDATION =====
//     const roleExists = await Role.findById(role);
//     if (!roleExists) return responseFormatter.error(req, res, 400, MSG.USER_INVALID_ROLE, CODES.USR_400);

//     // ===== CREATE USER =====
//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       phoneCode,
//       phoneNumber,
//       password,
//       role,
//       allowedCountries: Array.isArray(allowedCountries)
//         ? allowedCountries.map(c => c.toUpperCase())
//         : [],
//       status: status || 'ACTIVE',
//       createdBy: req.user._id
//     });

//     // ===== AUDIT LOG =====
//     await auditLogger?.({
//       req,
//       user: req.user,
//       action: 'CREATE_USER',
//       module: 'USERS',
//       entityId: user._id,
//       entityName: user.email,
//       after: user,
//       message: 'New user created'
//     });

//     return responseFormatter.success(req, res, MSG.USER_CREATED, user, null, 201);

//   } catch (err) {
//     console.error('Create user error:', err);
//     return responseFormatter.error(req, res, 500, MSG.USER_CREATE_FAILED, CODES.USR_500);
//   }
// };

// /**
//  * @desc    Get paginated user list
//  * @route   POST /api/systemusers/list
//  */
// exports.getUserList = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search, status, roleId, country } = req.body;

//     const query = {};
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } }
//       ];
//     }
//     if (status) query.status = status.toUpperCase();
//     if (roleId) query.role = roleId;
//     if (country) query.allowedCountries = country.toUpperCase();

//     const skip = (Number(page) - 1) * Number(limit);

//     const [users, total] = await Promise.all([
//       User.find(query)
//         .populate('role', 'name')
//         .select('-password -tokens')
//         .skip(skip)
//         .limit(Number(limit))
//         .sort({ createdAt: -1 }),
//       User.countDocuments(query)
//     ]);

//     return responseFormatter.success(req, res, MSG.USER_LIST_FETCHED, users, {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       totalPages: Math.ceil(total / limit)
//     }, 200);

//   } catch (err) {
//     console.error('Get user list error:', err);
//     return responseFormatter.error(req, res, 500, MSG.USER_LIST_FAILED, CODES.USR_500);
//   }
// };

// /**
//  * @desc    Update user information (no password)
//  * @route   PUT /api/systemusers/:id
//  */
// exports.updateUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

//     const { name, email, phoneNumber, role, allowedCountries, status } = req.body;

//     if (email && email !== user.email) {
//       const exists = await User.findOne({ email });
//       if (exists) return responseFormatter.error(req, res, 400, MSG.USER_EMAIL_EXISTS, CODES.USR_400);
//       user.email = email.toLowerCase();
//     }

//     if (role) {
//       const roleExists = await Role.findById(role);
//       if (!roleExists) return responseFormatter.error(req, res, 400, MSG.USER_INVALID_ROLE, CODES.USR_400);
//       user.role = role;
//     }

//     if (name) user.name = name;
//     if (phoneNumber) user.phoneNumber = phoneNumber;
//     if (status) user.status = status.toUpperCase();
//     if (allowedCountries) user.allowedCountries = allowedCountries.map(c => c.toUpperCase());

//     await user.save();

//     await auditLogger?.({
//       req,
//       user: req.user,
//       action: 'UPDATE_USER',
//       module: 'USERS',
//       entityId: user._id,
//       entityName: user.email,
//       after: user,
//       message: 'User updated'
//     });

//     return responseFormatter.success(req, res, MSG.USER_UPDATED, user, null, 200);

//   } catch (err) {
//     console.error('Update user error:', err);
//     return responseFormatter.error(req, res, 500, MSG.USER_UPDATE_FAILED, CODES.USR_500);
//   }
// };

// /**
//  * @desc    Admin reset user password
//  * @route   POST /api/systemusers/:id/reset-password
//  */
// exports.adminResetUserPassword = async (req, res) => {
//   try {
//     const { newPassword } = req.body;

//     if (!newPassword) return responseFormatter.error(req, res, 400, MSG.PASSWORD_REQUIRED, CODES.USR_400);
//     if (newPassword.length < 8) return responseFormatter.error(req, res, 400, MSG.PASSWORD_TOO_WEAK, CODES.USR_400);

//     const user = await User.findById(req.params.id).select('+password');
//     if (!user) return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

//     user.password = newPassword;
//     user.tokens = [];
//     await user.save();

//     await auditLogger?.({
//       req,
//       user: req.user,
//       action: 'RESET_PASSWORD',
//       module: 'USERS',
//       entityId: user._id,
//       entityName: user.email,
//       after: user,
//       message: 'Password Reset'
//     });

//     return responseFormatter.success(req, res, MSG.USER_PASSWORD_RESET, null, null, 200);

//   } catch (err) {
//     console.error('Reset password error:', err);
//     return responseFormatter.error(req, res, 500, MSG.PASSWORD_RESET_FAILED, CODES.USR_500);
//   }
// };

// /**
//  * @desc    User changes their own password
//  * @route   POST /api/systemusers/me/change-password
//  */
// exports.changeMyPassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) return responseFormatter.error(req, res, 400, MSG.PASSWORD_REQUIRED, CODES.USR_400);

//     const user = await User.findById(req.user._id).select('+password');
//     if (!user) return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) return responseFormatter.error(req, res, 401, MSG.PASSWORD_CURRENT_INVALID, CODES.USR_401);

//     user.password = newPassword;
//     user.tokens = [];
//     await user.save();

//     await auditLogger?.({
//       req,
//       user: req.user,
//       action: 'CHANGE_PASSWORD',
//       module: 'AUTH',
//       entityId: user._id,
//       entityName: user.email,
//       after: user,
//       message: 'Password Changed'
//     });

//     return responseFormatter.success(req, res, MSG.USER_PASSWORD_CHANGED, null, null, 200);

//   } catch (err) {
//     console.error('Change password error:', err);
//     return responseFormatter.error(req, res, 500, MSG.PASSWORD_CHANGE_FAILED, CODES.USR_500);
//   }
// };



/**
 * @file System Users Controller
 * @description Handles system-level user management including:
 *              - Creating users
 *              - Listing users
 *              - Updating users
 *              - Admin password reset
 *              - Self password change
 *              Includes full validation, RBAC safety, and audit logging.
 */

const User = require('../models/User');
const Role = require('../models/Role');
const auditLogger = require('../utils/auditLogger');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys'); 
const CODES = require('../config/constants/errorCodes');
const { 
  isValidEmail, 
  isValidPhone, 
  isValidPassword, 
  isValidName 
} = require('../utils/validator');


/**
 * @route   POST /api/systemusers
 * @desc    Create a new system user
 * @access  Admin / System
 */
exports.createUser = async (req, res) => {
  try {
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

    // ========================================
    // 1️⃣ Required field validation
    // ========================================
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

    // ========================================
    // 2️⃣ Format & business rule validation
    // ========================================
    if (!isValidName(name)) 
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_NAME_REQUIRED, CODES.USR_400);

    if (!isValidEmail(email)) 
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_EMAIL, CODES.USR_400);

    if (!isValidPhone(phoneNumber)) 
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_PHONE, CODES.USR_400);

    if (!isValidPassword(password)) 
      return responseFormatter.error(req, res, 400, MSG.VALIDATION_INVALID_PASSWORD, CODES.USR_400);

    // ========================================
    // 3️⃣ Duplicate email check
    // - Prevents multiple accounts with same email
    // ========================================
    const existing = await User.findOne({ email });
    if (existing) 
      return responseFormatter.error(req, res, 400, MSG.USER_EMAIL_EXISTS, CODES.USR_400);

    // ========================================
    // 4️⃣ Role validation
    // - Ensures role exists before assignment
    // ========================================
    const roleExists = await Role.findById(role);
    if (!roleExists) 
      return responseFormatter.error(req, res, 400, MSG.USER_INVALID_ROLE, CODES.USR_400);

    // ========================================
    // 5️⃣ Create user record
    // - Normalize email
    // - Normalize country codes
    // - Track creator for audit
    // ========================================
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phoneCode,
      phoneNumber,
      password,
      role,
      allowedCountries: Array.isArray(allowedCountries)
        ? allowedCountries.map(c => c.toUpperCase())
        : [],
      status: status || 'ACTIVE',
      createdBy: req.user._id
    });

    // ========================================
    // 6️⃣ Audit logging (security + compliance)
    // ========================================
    await auditLogger?.({
      req,
      user: req.user,
      action: 'CREATE_USER',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      after: user,
      message: 'New user created'
    });

    // ========================================
    // 7️⃣ Success response
    // ========================================
    return responseFormatter.success(req, res, MSG.USER_CREATED, user, null, 201);

  } catch (err) {
    // Global error handler
    console.error('Create user error:', err);
    return responseFormatter.error(req, res, 500, MSG.USER_CREATE_FAILED, CODES.USR_500);
  }
};


/**
 * @route   POST /api/systemusers/list
 * @desc    Get paginated user list with filters
 * @access  Admin / System
 */
exports.getUserList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, roleId, country } = req.body;

    // ========================================
    // 1️⃣ Build dynamic query filters
    // ========================================
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status.toUpperCase();
    if (roleId) query.role = roleId;
    if (country) query.allowedCountries = country.toUpperCase();

    // ========================================
    // 2️⃣ Pagination calculation
    // ========================================
    const skip = (Number(page) - 1) * Number(limit);

    // ========================================
    // 3️⃣ Fetch users + total count in parallel
    // ========================================
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name')
        .select('-password -tokens')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      User.countDocuments(query)
    ]);

    // ========================================
    // 4️⃣ Return paginated response
    // ========================================
    return responseFormatter.success(req, res, MSG.USER_LIST_FETCHED, users, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }, 200);

  } catch (err) {
    console.error('Get user list error:', err);
    return responseFormatter.error(req, res, 500, MSG.USER_LIST_FAILED, CODES.USR_500);
  }
};


/**
 * @route   PUT /api/systemusers/:id
 * @desc    Update user information (excluding password)
 * @access  Admin / System
 */
exports.updateUser = async (req, res) => {
  try {
    // ========================================
    // 1️⃣ Load target user
    // ========================================
    const user = await User.findById(req.params.id);
    if (!user) 
      return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

    const { name, email, phoneNumber, role, allowedCountries, status } = req.body;

    // ========================================
    // 2️⃣ Email change + duplicate check
    // ========================================
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) 
        return responseFormatter.error(req, res, 400, MSG.USER_EMAIL_EXISTS, CODES.USR_400);

      user.email = email.toLowerCase();
    }

    // ========================================
    // 3️⃣ Role change validation
    // ========================================
    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists) 
        return responseFormatter.error(req, res, 400, MSG.USER_INVALID_ROLE, CODES.USR_400);

      user.role = role;
    }

    // ========================================
    // 4️⃣ Apply allowed updates
    // ========================================
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (status) user.status = status.toUpperCase();
    if (allowedCountries) user.allowedCountries = allowedCountries.map(c => c.toUpperCase());

    await user.save();

    // ========================================
    // 5️⃣ Audit log
    // ========================================
    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_USER',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      after: user,
      message: 'User updated'
    });

    return responseFormatter.success(req, res, MSG.USER_UPDATED, user, null, 200);

  } catch (err) {
    console.error('Update user error:', err);
    return responseFormatter.error(req, res, 500, MSG.USER_UPDATE_FAILED, CODES.USR_500);
  }
};


/**
 * @route   POST /api/systemusers/:id/reset-password
 * @desc    Admin resets a user's password
 * @access  Admin / System
 */
exports.adminResetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // ========================================
    // 1️⃣ Validate new password
    // ========================================
    if (!newPassword) 
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_REQUIRED, CODES.USR_400);

    if (newPassword.length < 8) 
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_TOO_WEAK, CODES.USR_400);

    // ========================================
    // 2️⃣ Load user with password field
    // ========================================
    const user = await User.findById(req.params.id).select('+password');
    if (!user) 
      return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

    // ========================================
    // 3️⃣ Reset password & revoke sessions
    // ========================================
    user.password = newPassword;
    user.tokens = []; // Force logout from all devices
    await user.save();

    // ========================================
    // 4️⃣ Audit log
    // ========================================
    await auditLogger?.({
      req,
      user: req.user,
      action: 'RESET_PASSWORD',
      module: 'USERS',
      entityId: user._id,
      entityName: user.email,
      after: user,
      message: 'Password Reset'
    });

    return responseFormatter.success(req, res, MSG.USER_PASSWORD_RESET, null, null, 200);

  } catch (err) {
    console.error('Reset password error:', err);
    return responseFormatter.error(req, res, 500, MSG.PASSWORD_RESET_FAILED, CODES.USR_500);
  }
};


/**
 * @route   POST /api/systemusers/me/change-password
 * @desc    User changes their own password
 * @access  Authenticated User
 */
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // ========================================
    // 1️⃣ Validate required fields
    // ========================================
    if (!currentPassword || !newPassword) 
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_REQUIRED, CODES.USR_400);

    // ========================================
    // 2️⃣ Load current user with password
    // ========================================
    const user = await User.findById(req.user._id).select('+password');
    if (!user) 
      return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

    // ========================================
    // 3️⃣ Verify current password
    // ========================================
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) 
      return responseFormatter.error(req, res, 401, MSG.PASSWORD_CURRENT_INVALID, CODES.USR_401);

    // ========================================
    // 4️⃣ Update password & revoke sessions
    // ========================================
    user.password = newPassword;
    user.tokens = []; // Force logout from all devices
    await user.save();

    // ========================================
    // 5️⃣ Audit log
    // ========================================
    await auditLogger?.({
      req,
      user: req.user,
      action: 'CHANGE_PASSWORD',
      module: 'AUTH',
      entityId: user._id,
      entityName: user.email,
      after: user,
      message: 'Password Changed'
    });

    return responseFormatter.success(req, res, MSG.USER_PASSWORD_CHANGED, null, null, 200);

  } catch (err) {
    console.error('Change password error:', err);
    return responseFormatter.error(req, res, 500, MSG.PASSWORD_CHANGE_FAILED, CODES.USR_500);
  }
};
