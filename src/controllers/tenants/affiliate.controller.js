const AffiliateProfile = require('../../models/tenants/Affiliate');
const MSG = require('../../config/constants/messageKeys'); // message keys
const CODES = require('../../config/constants/errorCodes'); // error codes
const { success, error } = require('../../utils/responseFormatter');
const auditLogger = require('../../utils/auditLogger'); // Audit logging utility

// ===========================================
// Create a new affiliate
// ===========================================
exports.createAffiliate = async (req, res) => {
  try {
    const { email, phoneCode, phoneNumber, password, photo, languages, website, kybVerified, status, createdBy } = req.body;

    const affiliate = new AffiliateProfile({
      email,
      phoneCode,
      phoneNumber,
      password,
      photo,
      name: languages.name,
      companyName: languages.companyName,
      bio: languages.bio,
      address: languages.address,
      website,
      kybVerified,
      status,
      createdBy
    });

    await affiliate.save();

    // Log audit
    await auditLogger?.({
      req,
      user: req.user,
      action: 'AFFILIATE_CREATE',
      module: 'AFFILIATES',
      entityId: affiliate._id,
      entityName: affiliate.name?.en || affiliate.email,
      after: affiliate,
      message: req.t(MSG.AFFILIATE_CREATED)
    });

    return success(req, res, MSG.AFFILIATE_CREATED, affiliate, null, 201);
  } catch (err) {
    console.error(err);
    return error(req, res, 500, MSG.AFFILIATE_CREATE_FAILED, CODES.USR_500);
  }
};

// ===========================================
// Get affiliate by ID
// ===========================================
exports.getAffiliateById = async (req, res) => {
  try {
    const affiliate = await AffiliateProfile.findOne({ _id: req.params.id, isDeleted: false });

    if (!affiliate) {
      return error(req, res, 404, MSG.AFFILIATE_NOT_FOUND, CODES.USR_404);
    }

    // Log audit
    await auditLogger?.({
      req,
      user: req.user,
      action: 'AFFILIATE_VIEW',
      module: 'AFFILIATES',
      entityId: affiliate._id,
      entityName: affiliate.name?.en || affiliate.email,
      after: affiliate,
      message: req.t(MSG.AFFILIATE_FETCHED)
    });

    return success(req, res, MSG.AFFILIATE_FETCHED, affiliate, "", 201);
  } catch (err) {
    console.error(err);
    return error(req, res, 500, MSG.AFFILIATE_FETCH_FAILED, CODES.USR_500);
  }
};

// ===========================================
// Update affiliate
// ===========================================
exports.updateAffiliate = async (req, res) => {
  try {
    const affiliate = await AffiliateProfile.findOne({ _id: req.params.id, isDeleted: false });
    if (!affiliate) {
      return error(req, res, 404, MSG.AFFILIATE_NOT_FOUND, CODES.USR_404);
    }

    const { email, phoneCode, phoneNumber, photo, languages, website, kybVerified, status } = req.body;

    if (email) affiliate.email = email;
    if (phoneCode) affiliate.phoneCode = phoneCode;
    if (phoneNumber) affiliate.phoneNumber = phoneNumber;
    if (photo) affiliate.photo = photo;
    if (languages) {
      if (languages.name) affiliate.name = languages.name;
      if (languages.companyName) affiliate.companyName = languages.companyName;
      if (languages.bio) affiliate.bio = languages.bio;
      if (languages.address) affiliate.address = languages.address;
    }
    if (website) affiliate.website = website;
    if (kybVerified !== undefined) affiliate.kybVerified = kybVerified;
    if (status) affiliate.status = status;

    await affiliate.save();

    // Log audit
    await auditLogger?.({
      req,
      user: req.user,
      action: 'AFFILIATE_UPDATE',
      module: 'AFFILIATES',
      entityId: affiliate._id,
      entityName: affiliate.name?.en || affiliate.email,
      after: affiliate,
      message: req.t(MSG.AFFILIATE_UPDATED)
    });

    return success(req, res, MSG.AFFILIATE_UPDATED, affiliate, "", 201);
  } catch (err) {
    console.error(err);
    return error(req, res, 500, MSG.AFFILIATE_UPDATE_FAILED, CODES.USR_500);
  }
};

// ===========================================
// Soft delete affiliate
// ===========================================
exports.softDeleteAffiliate = async (req, res) => {
  try {
    const affiliate = await AffiliateProfile.findOne({ _id: req.params.id, isDeleted: false });
    if (!affiliate) {
      return error(req, res, 404, MSG.AFFILIATE_NOT_FOUND, CODES.USR_404);
    }

    affiliate.isDeleted = true;
    affiliate.deletedAt = new Date();
    await affiliate.save();

    // Log audit
    await auditLogger?.({
      req,
      user: req.user,
      action: 'AFFILIATE_DELETE',
      module: 'AFFILIATES',
      entityId: affiliate._id,
      entityName: affiliate.name?.en || affiliate.email,
      after: affiliate,
      message: req.t(MSG.AFFILIATE_SOFT_DELETED)
    });

    return success(req, res, MSG.AFFILIATE_SOFT_DELETED, null, "", 201);
  } catch (err) {
    console.error(err);
    return error(req, res, 500, MSG.AFFILIATE_DELETE_FAILED, CODES.USR_500);
  }
};

// ===========================================
// List all affiliates with pagination
// ===========================================
exports.listAffiliates = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.body;
    const query = { isDeleted: false };

    // Filter by affiliate name (English only for search)
    if (search) query['name.en'] = { $regex: search, $options: 'i' };

    // Filter by status
    if (status) query.status = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch affiliates and total count in parallel
    const [affiliates, total] = await Promise.all([
      AffiliateProfile.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AffiliateProfile.countDocuments(query)
    ]);

    const meta = {
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };

    // Log audit
    await auditLogger?.({
      req,
      user: req.user,
      action: 'AFFILIATE_VIEW',
      module: 'AFFILIATES',
      entityId: null,
      entityName: null,
      after: affiliates,
      message: req.t(MSG.AFFILIATE_LIST_FETCHED)
    });

    return success(req, res, MSG.AFFILIATE_LIST_FETCHED, affiliates, meta, 200);
  } catch (err) {
    console.error('List affiliates error:', err);
    return error(req, res, 500, MSG.AFFILIATE_LIST_FETCH_FAILED, CODES.USR_500);
  }
};
