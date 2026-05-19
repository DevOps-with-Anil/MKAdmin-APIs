const KYBDocType = require('../../models/settings/KybDoc');
const auditLogger = require('../../utils/auditLogger');
const User = require("../../models/rbac/RootAdmin");
const responseFormatter = require('../../utils/responseFormatter');
const MSG = require('../../config/constants/messageKeys');
const { DEFAULT_LANG } = require('../../utils/i18n');

/* ================= NORMALIZE ================= */
function normalizeDocType(type) {
  return type?.trim().toUpperCase();
}

/* ================= USER VALIDATION ================= */
async function validateUser(req, res) {
  try {
    if (!req.user?._id) {
      responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_INVALID);
      return null;
    }

    const user = await User.findById(req.user._id).lean();

    if (!user || user.isDeleted) {
      responseFormatter.error(req, res, 403, MSG.USER_INVALID);
      return null;
    }

    return user;

  } catch (err) {
    console.error("Validate User Error:", err);
    responseFormatter.error(req, res, 500, MSG.USER_VALIDATION_FAILED);
    return null;
  }
}

/* ================= LOCALIZATION ================= */
function localizeField(field, lang) {
  if (!field || typeof field !== "object") return field;
  return field[lang] || field[DEFAULT_LANG] || "";
}

function localizeKYBDocType(doc, lang) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    label: localizeField(obj.label, lang),
    description: localizeField(obj.description, lang)
  };
}

/* ============================================================
➕ ADD DOCUMENT TYPE
============================================================ */
exports.addKYBDocType = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const {
      type,
      label = {},
      description = {},
      isRequired = false,
      isEnabled = false
    } = req.body;

    /* VALIDATION */
    if (!type) {
      return responseFormatter.error(req, res, 400, MSG.KYB_DOC_TYPE_TYPE_REQUIRED);
    }

    if (typeof label !== "object" || !label.en) {
      return responseFormatter.error(req, res, 400, MSG.KYB_DOC_TYPE_LABEL_INVALID);
    }

    const normalizedType = normalizeDocType(type);

    /* DUPLICATE CHECK */
    const exists = await KYBDocType.findOne({
      type: normalizedType,
      isDeleted: false
    });

    if (exists) {
      return responseFormatter.error(req, res, 409, MSG.KYB_DOC_TYPE_ALREADY_EXISTS);
    }

    /* CREATE */
    const doc = await KYBDocType.create({
      type: normalizedType,
      label,
      description,
      isRequired,
      isEnabled,
      createdBy: user._id
    });

    /* AUDIT */
    await auditLogger?.({
      req,
      user,
      action: "KYB_DOC_TYPE_CREATE",
      module: "KYB_DOC_TYPE",
      entityId: doc._id,
      entityName: doc.type,
      after: doc
    });

    const localizedDoc = localizeKYBDocType(doc, lang);

    return responseFormatter.success(
      req,
      res,
      MSG.KYB_DOC_TYPE_CREATED,
      localizedDoc,
      null,
      201
    );

  } catch (err) {
    console.error("addKYBDocType error:", err);
    return responseFormatter.error(req, res, 500, MSG.KYB_DOC_TYPE_SERVER_ERROR);
  }
};

/* ============================================================
✏️ UPDATE DOCUMENT TYPE
============================================================ */
exports.updateKYBDocType = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const { id } = req.params;
    const { label, description } = req.body;

    const doc = await KYBDocType.findById(id);

    if (!doc) {
      return responseFormatter.error(req, res, 404, MSG.KYB_DOC_TYPE_NOT_FOUND);
    }

    const before = doc.toObject();

    if (label) doc.label = label;
    if (description !== undefined) doc.description = description;

    doc.updatedBy = user._id;

    await doc.save();

    await auditLogger?.({
      req,
      user,
      action: "KYB_DOC_TYPE_UPDATE",
      module: "KYB_DOC_TYPE",
      entityId: doc._id,
      entityName: doc.type,
      before,
      after: doc
    });

    return responseFormatter.success(
      req,
      res,
      MSG.KYB_DOC_TYPE_UPDATED,
      doc,
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(req, res, 500, MSG.KYB_DOC_TYPE_SERVER_ERROR);
  }
};

/* ============================================================
🔁 TOGGLE ENABLE / DISABLE
============================================================ */
exports.toggleKYBDocTypeStatus = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const { id } = req.params;

    const doc = await KYBDocType.findById(id);

    if (!doc) {
      return responseFormatter.error(req, res, 404, MSG.KYB_DOC_TYPE_NOT_FOUND);
    }

    const before = doc.toObject();

    doc.isEnabled = req.body.isEnabled;
    doc.updatedBy = user._id;

    await doc.save();

    await auditLogger?.({
      req,
      user,
      action: "KYB_DOC_TYPE_STATUS_TOGGLE",
      module: "KYB_DOC_TYPE",
      entityId: doc._id,
      entityName: doc.type,
      before,
      after: doc
    });

    return responseFormatter.success(
      req,
      res,
      doc.isEnabled
        ? MSG.KYB_DOC_TYPE_ENABLED
        : MSG.KYB_DOC_TYPE_DISABLED,
      doc,
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(req, res, 500, MSG.KYB_DOC_TYPE_SERVER_ERROR);
  }
};

/* ============================================================
⭐ TOGGLE REQUIRED STATUS
============================================================ */
exports.toggleKYBRequiredStatus = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const { id } = req.params;

    const doc = await KYBDocType.findById(id);

    if (!doc) {
      return responseFormatter.error(req, res, 404, MSG.KYB_DOC_TYPE_NOT_FOUND);
    }

    const before = doc.toObject();

    doc.isRequired = req.body.isRequired;
    doc.updatedBy = user._id;

    await doc.save();

    await auditLogger?.({
      req,
      user,
      action: "KYB_DOC_TYPE_REQUIRED_TOGGLE",
      module: "KYB_DOC_TYPE",
      entityId: doc._id,
      entityName: doc.type,
      before,
      after: doc
    });

    return responseFormatter.success(
      req,
      res,
      MSG.KYB_DOC_TYPE_REQUIRED_UPDATED,
      doc,
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(req, res, 500, MSG.KYB_DOC_TYPE_SERVER_ERROR);
  }
};

/* ============================================================
🗑️ DELETE DOCUMENT TYPE
============================================================ */
exports.deleteKYBDocType = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const { id } = req.params;

    const doc = await KYBDocType.findById(id);

    if (!doc) {
      return responseFormatter.error(req, res, 404, MSG.KYB_DOC_TYPE_NOT_FOUND);
    }

    const before = doc.toObject();

    // await KYBDocType.deleteOne({ _id: id });


    doc.isDeleted = true;
    doc.updatedBy = user._id;

    await doc.save();

    await auditLogger?.({
      req,
      user,
      action: "KYB_DOC_TYPE_DELETE",
      module: "KYB_DOC_TYPE",
      entityId: id,
      entityName: doc.type,
      before
    });

    return responseFormatter.success(
      req,
      res,
      MSG.KYB_DOC_TYPE_DELETED,
      null,
      null,
      201
    );

  } catch (err) {
    console.error(err);
    return responseFormatter.error(req, res, 500, MSG.KYB_DOC_TYPE_SERVER_ERROR);
  }
};

/* ============================================================
📄 GET ALL DOCUMENT TYPES
============================================================ */
exports.getKYBDocTypes = async (req, res) => {
  try {
    const user = await validateUser(req, res);
    if (!user) return;

    const lang = req.lang || DEFAULT_LANG;

    const {
      page = 1,
      limit = 20,
      search = "",
      isEnabled,
    } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.type = { $regex: search, $options: "i" };
    }

    if (typeof isEnabled !== "undefined") {
      query.isEnabled = isEnabled === "true";
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      KYBDocType.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      KYBDocType.countDocuments(query)
    ]);

    const localizedDocs = docs.map(doc =>
      localizeKYBDocType(doc, lang)
    );

    const meta = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    };

    return responseFormatter.success(
      req,
      res,
      MSG.KYB_DOC_TYPE_FETCHED,
      localizedDocs,
      meta,
      200
    );

  } catch (err) {
    console.error("getKYBDocTypes error:", err);

    return responseFormatter.error(
      req,
      res,
      500,
      MSG.KYB_DOC_TYPE_FETCH_FAILED
    );
  }
};