const CMS = require('../models/CMS');
const auditLogger = require('../utils/auditLogger');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');
const CODES = require('../config/constants/errorCodes');
const { isValidObjectId } = require('../utils/validator');

const ALLOWED_STATUSES = new Set(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const ALLOWED_TYPES = new Set(['PAGE', 'ARTICLE', 'POST', 'BANNER', 'OTHER']);

function getOwnerAdminId(user) {
  return String(user?.createdBy || user?._id || '');
}

function buildOwnershipQuery(user) {
  return {
    ownerAdmin: getOwnerAdminId(user),
    isDeleted: false
  };
}

function normalizeLocalizedInput(value) {
  if (!value || typeof value !== 'object') return null;

  const normalized = {
    en: String(value.en || '').trim(),
    fr: String(value.fr || '').trim(),
    ar: String(value.ar || '').trim()
  };

  return normalized;
}

function createSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateCmsPayload(body, isUpdate = false) {
  const errors = [];
  const title = normalizeLocalizedInput(body.title);
  const content = normalizeLocalizedInput(body.content);
  const slug = createSlug(body.slug || title?.en);
  const status = body.status ? String(body.status).trim().toUpperCase() : undefined;
  const type = body.type ? String(body.type).trim().toUpperCase() : undefined;

  if (!isUpdate || body.title !== undefined) {
    if (!title?.en) errors.push({ status: 400, key: MSG.CMS_TITLE_REQUIRED, code: CODES.CMS_TITLE_REQUIRED });
  }

  if (!isUpdate || body.content !== undefined) {
    if (!content?.en) errors.push({ status: 400, key: MSG.CMS_CONTENT_REQUIRED, code: CODES.CMS_CONTENT_REQUIRED });
  }

  if ((!isUpdate || body.slug !== undefined || body.title !== undefined) && !slug) {
    errors.push({ status: 400, key: MSG.CMS_TITLE_REQUIRED, code: CODES.CMS_TITLE_REQUIRED });
  }

  if (status && !ALLOWED_STATUSES.has(status)) {
    errors.push({ status: 400, key: MSG.CMS_INVALID_STATUS, code: CODES.CMS_INVALID_STATUS });
  }

  if (type && !ALLOWED_TYPES.has(type)) {
    errors.push({ status: 400, key: MSG.CMS_INVALID_TYPE, code: CODES.CMS_INVALID_TYPE });
  }

  return {
    errors,
    normalized: {
      title,
      content,
      slug,
      status,
      type,
      tags: Array.isArray(body.tags)
        ? body.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : undefined,
      meta: body.meta && typeof body.meta === 'object' && !Array.isArray(body.meta)
        ? body.meta
        : undefined
    }
  };
}

exports.createCms = async (req, res) => {
  try {
    const ownerAdminId = getOwnerAdminId(req.user);
    if (!isValidObjectId(ownerAdminId)) {
      return responseFormatter.error(req, res, 400, MSG.USER_NOT_FOUND, CODES.USER_NOT_FOUND);
    }

    const { errors, normalized } = validateCmsPayload(req.body);
    if (errors.length > 0) {
      const firstError = errors[0];
      return responseFormatter.error(req, res, firstError.status, firstError.key, firstError.code);
    }

    const existing = await CMS.findOne({
      ownerAdmin: ownerAdminId,
      slug: normalized.slug,
      isDeleted: false
    });

    if (existing) {
      return responseFormatter.error(req, res, 409, MSG.CMS_SLUG_EXISTS, CODES.CMS_SLUG_EXISTS);
    }

    const cms = await CMS.create({
      type: normalized.type || 'PAGE',
      title: normalized.title,
      content: normalized.content,
      slug: normalized.slug,
      status: normalized.status || 'DRAFT',
      ownerAdmin: ownerAdminId,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      tags: normalized.tags || [],
      meta: normalized.meta || {},
      publishedAt: normalized.status === 'PUBLISHED' ? new Date() : null
    });

    await auditLogger?.({
      req,
      user: req.user,
      action: 'CMS_CREATE',
      module: 'CMS',
      entityId: cms._id,
      entityName: cms.slug,
      after: cms,
      message: 'CMS entry created'
    });

    return responseFormatter.success(req, res, MSG.CMS_CREATED, cms, null, 201);
  } catch (err) {
    console.error('Create CMS error:', err);
    return responseFormatter.error(req, res, 500, MSG.CMS_CREATE_FAILED, CODES.CMS_CREATE_FAILED);
  }
};

exports.listCms = async (req, res) => {
  try {
    const source = req.method === 'GET' ? req.query : req.body;
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      type = '',
      createdBy = ''
    } = source;

    const query = buildOwnershipQuery(req.user);

    if (search) {
      query.$or = [
        { 'title.en': { $regex: String(search).trim(), $options: 'i' } },
        { 'content.en': { $regex: String(search).trim(), $options: 'i' } },
        { slug: { $regex: String(search).trim(), $options: 'i' } },
        { tags: { $elemMatch: { $regex: String(search).trim(), $options: 'i' } } }
      ];
    }

    if (status) query.status = String(status).trim().toUpperCase();
    if (type) query.type = String(type).trim().toUpperCase();
    if (createdBy && isValidObjectId(createdBy)) query.createdBy = createdBy;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      CMS.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      CMS.countDocuments(query)
    ]);

    return responseFormatter.success(req, res, MSG.CMS_LIST_FETCHED, items, {
      page: pageNumber,
      limit: limitNumber,
      search: String(search || ''),
      status: String(status || ''),
      type: String(type || ''),
      total,
      totalPages: Math.ceil(total / limitNumber)
    }, 200);
  } catch (err) {
    console.error('List CMS error:', err);
    return responseFormatter.error(req, res, 500, MSG.CMS_LIST_FAILED, CODES.CMS_LIST_FAILED);
  }
};

exports.getCmsById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return responseFormatter.error(req, res, 404, MSG.CMS_NOT_FOUND, CODES.CMS_NOT_FOUND);
    }

    const cms = await CMS.findOne({
      _id: req.params.id,
      ...buildOwnershipQuery(req.user)
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!cms) {
      return responseFormatter.error(req, res, 404, MSG.CMS_NOT_FOUND, CODES.CMS_NOT_FOUND);
    }

    return responseFormatter.success(req, res, MSG.CMS_FETCHED, cms, null, 200);
  } catch (err) {
    console.error('Get CMS error:', err);
    return responseFormatter.error(req, res, 500, MSG.CMS_FETCH_FAILED, CODES.CMS_FETCH_FAILED);
  }
};

exports.updateCms = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return responseFormatter.error(req, res, 404, MSG.CMS_NOT_FOUND, CODES.CMS_NOT_FOUND);
    }

    const cms = await CMS.findOne({
      _id: req.params.id,
      ...buildOwnershipQuery(req.user)
    });

    if (!cms) {
      return responseFormatter.error(req, res, 404, MSG.CMS_NOT_FOUND, CODES.CMS_NOT_FOUND);
    }

    const before = cms.toObject();
    const { errors, normalized } = validateCmsPayload(req.body, true);
    if (errors.length > 0) {
      const firstError = errors[0];
      return responseFormatter.error(req, res, firstError.status, firstError.key, firstError.code);
    }

    if (normalized.slug && normalized.slug !== cms.slug) {
      const existing = await CMS.findOne({
        ownerAdmin: cms.ownerAdmin,
        slug: normalized.slug,
        isDeleted: false,
        _id: { $ne: cms._id }
      });

      if (existing) {
        return responseFormatter.error(req, res, 409, MSG.CMS_SLUG_EXISTS, CODES.CMS_SLUG_EXISTS);
      }
      cms.slug = normalized.slug;
    }

    if (normalized.title) cms.title = normalized.title;
    if (normalized.content) cms.content = normalized.content;
    if (normalized.type) cms.type = normalized.type;
    if (normalized.status) cms.status = normalized.status;
    if (normalized.tags) cms.tags = normalized.tags;
    if (normalized.meta) cms.meta = normalized.meta;
    cms.updatedBy = req.user._id;

    if (cms.status === 'PUBLISHED' && !cms.publishedAt) {
      cms.publishedAt = new Date();
    }
    if (cms.status !== 'PUBLISHED') {
      cms.publishedAt = null;
    }

    await cms.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'CMS_UPDATE',
      module: 'CMS',
      entityId: cms._id,
      entityName: cms.slug,
      before,
      after: cms,
      message: 'CMS entry updated'
    });

    return responseFormatter.success(req, res, MSG.CMS_UPDATED, cms, null, 200);
  } catch (err) {
    console.error('Update CMS error:', err);
    return responseFormatter.error(req, res, 500, MSG.CMS_UPDATE_FAILED, CODES.CMS_UPDATE_FAILED);
  }
};

exports.deleteCms = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return responseFormatter.error(req, res, 404, MSG.CMS_NOT_FOUND, CODES.CMS_NOT_FOUND);
    }

    const cms = await CMS.findOne({
      _id: req.params.id,
      ...buildOwnershipQuery(req.user)
    });

    if (!cms) {
      return responseFormatter.error(req, res, 404, MSG.CMS_NOT_FOUND, CODES.CMS_NOT_FOUND);
    }

    const before = cms.toObject();
    cms.isDeleted = true;
    cms.deletedAt = new Date();
    cms.updatedBy = req.user._id;
    await cms.save();

    await auditLogger?.({
      req,
      user: req.user,
      action: 'CMS_DELETE',
      module: 'CMS',
      entityId: cms._id,
      entityName: cms.slug,
      before,
      after: null,
      message: 'CMS entry deleted'
    });

    return responseFormatter.success(req, res, MSG.CMS_DELETED, { _id: cms._id }, null, 200);
  } catch (err) {
    console.error('Delete CMS error:', err);
    return responseFormatter.error(req, res, 500, MSG.CMS_DELETE_FAILED, CODES.CMS_DELETE_FAILED);
  }
};
