/**
 * ==========================================================
 * 📁 System Users Controller (Enterprise + i18n Enabled)
 * ==========================================================
 */

const User = require('../../models/platform/User');
const Role = require('../../models/rbac/SystemRole');
const auditLogger = require('../../utils/auditLogger');
const responseFormatter = require('../../utils/responseFormatter');
const MSG = require('../../config/constants/messageKeys');
const CODES = require('../../config/constants/errorCodes');

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

    const populatedUser = await user.populate('role', 'name');

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
      localizeUser(populatedUser, lang),
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
    const { page = 1, limit = 10, search, status, roleId, country } = req.body;

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

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name')
        .select('-password -tokens')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      User.countDocuments(query)
    ]);

    const localizedUsers = users.map(u => localizeUser(u, lang));

    return responseFormatter.success(
      req,
      res,
      MSG.USER_LIST_FETCHED,
      localizedUsers,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      200
    );

  } catch (err) {
    console.error('Get user list error:', err);
    return responseFormatter.error(req, res, 500, MSG.USER_LIST_FAILED, CODES.USR_500);
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

    if (!user)
      return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

    const before = user.toObject();

    const { name, email, phoneNumber, role, allowedCountries, status } = req.body;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists)
        return responseFormatter.error(req, res, 400, MSG.USER_EMAIL_EXISTS, CODES.USR_400);

      user.email = email.toLowerCase();
    }

    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists)
        return responseFormatter.error(req, res, 400, MSG.USER_INVALID_ROLE, CODES.USR_400);

      user.role = role;
    }

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (status) user.status = status.toUpperCase();
    if (allowedCountries)
      user.allowedCountries = allowedCountries.map(c => c.toUpperCase());

    await user.save();

    const populatedUser = await user.populate('role', 'name');

    await auditLogger?.({
      req,
      user: req.user,
      action: 'UPDATE_USER',
      module: 'USERS',
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
      200
    );

  } catch (err) {
    console.error('Update user error:', err);
    return responseFormatter.error(req, res, 500, MSG.USER_UPDATE_FAILED, CODES.USR_500);
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
 * ==========================================================
 * 🔹 Change My Password
 * ==========================================================
 */
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_REQUIRED, CODES.USR_400);

    const user = await User.findById(req.user._id).select('+password');

    if (!user)
      return responseFormatter.error(req, res, 404, MSG.USER_NOT_FOUND, CODES.USR_404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return responseFormatter.error(req, res, 401, MSG.PASSWORD_CURRENT_INVALID, CODES.USR_401);

    if (!isValidPassword(newPassword))
      return responseFormatter.error(req, res, 400, MSG.PASSWORD_TOO_WEAK, CODES.USR_400);

    user.password = newPassword;
    user.tokens = [];
    await user.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'CHANGE_PASSWORD',
      module: 'AUTH',
      entityId: user._id,
      entityName: user.email,
      before: null,
      after: null,
      message: req.t(MSG.USER_PASSWORD_CHANGED)
    });

    return responseFormatter.success(
      req,
      res,
      MSG.USER_PASSWORD_CHANGED,
      null,
      null,
      200
    );

  } catch (err) {
    console.error('Change password error:', err);
    return responseFormatter.error(req, res, 500, MSG.PASSWORD_CHANGE_FAILED, CODES.USR_500);
  }
};