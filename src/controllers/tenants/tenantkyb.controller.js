const path = require("path");
const fs = require("fs");
const TenantKYB = require("../../models/tenants/TenantKYB");
const KYBDocType = require('../../models/settings/KybDoc');
// const RootAdmin = require("../../models/rbac/RootAdmin");
// const TenantAdmin = require("../../models/affiliates/rbac/TenantAdmin");
const Tenant = require('../../models/tenants/Tenant');
const MSG = require('../../config/constants/messageKeys');
const responseFormatter = require("../../utils/responseFormatter");
const auditLogger = require('../../utils/auditLogger');
const { DEFAULT_LANG } = require('../../utils/i18n');

/* ================= HELPERS ================= */

function normalizeDocType(type) {
    return type?.trim().toUpperCase();
}

function safeJSONParse(data, defaultValue = []) {
    try {
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}

function localizeKYB(kyb, lang = DEFAULT_LANG) {
    if (!kyb) return null;

    const obj = kyb.toObject ? kyb.toObject() : kyb;

    obj.tenantId.companyName =
        obj.tenantId.companyName?.[lang] || obj.tenantId.companyName?.[DEFAULT_LANG] || "";
    // obj.description =
    // obj.description?.[lang] || obj.description?.[DEFAULT_LANG] || "";

    return obj;
}

function updateKYBStatus(kyb) {
    const statuses = kyb.documents.map(d => d.status);

    if (statuses.every(s => s === "APPROVED")) {
        kyb.status = "APPROVED";
    } else if (statuses.some(s => s === "REJECTED")) {
        kyb.status = "REJECTED";
    } else if (statuses.some(s => s === "SUSPENDED")) {
        kyb.status = "SUSPENDED";
    } else {
        kyb.status = "UNDER_REVIEW";
    }

    return kyb.status;
}

/* ============================================================
UPLOAD TENANT KYB DOCUMETS
============================================================ */

exports.uploadTenantKYB = async (req, res) => {
    try {

        const lang = req.lang || DEFAULT_LANG;
        const user = req.user
        const { tenantId } = req.body;
        const documents = safeJSONParse(req.body.documents, []);
        const uploadedFiles = req.files || [];


        if (!tenantId) {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.KYB_TENANT_ID_REQUIRED
            );
        }

        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.TENANT_NOT_FOUND
            );
        }

        if (tenant.status !== "ACTIVE") {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.TENANT_NOT_ACTIVE
            );
        }

        if (!Array.isArray(documents) || documents.length === 0) {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.KYB_DOCUMENTS_REQUIRED
            );
        }

        /*
         * FETCH ACTIVE KYB DOC TYPES
         */
        const kybDocTypes = await KYBDocType.find({
            isEnabled: true,
            isDeleted: false
        }).lean();

        if (!kybDocTypes.length) {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.KYB_DOCUMENT_NOT_FOUND
            );
        }

        /*
         * ALLOWED DOC TYPES
         */
        const allowedTypes = kybDocTypes.map(doc =>
            normalizeDocType(doc.type)
        );

        /*
         * REQUIRED DOC TYPES
         */
        const requiredTypes = kybDocTypes
            .filter(doc => doc.isRequired)
            .map(doc => normalizeDocType(doc.type));

        /*
         * VALIDATE DOCUMENTS
         */
        for (const doc of documents) {
            if (!doc.type) {
                return responseFormatter.error(
                    req,
                    res,
                    400,
                    MSG.KYB_DOC_TYPE_REQUIRED
                );
            }

            const normalizedType = normalizeDocType(doc.type);

            /*
             * ONLY KYB DOC TYPES ARE ALLOWED
             */
            if (!allowedTypes.includes(normalizedType)) {
                return responseFormatter.error(
                    req,
                    res,
                    400,
                    MSG.KYB_INVALID_DOC_TYPE
                );
            }

            /*
             * VALIDATE FILE INDEXES
             */
            if (doc.fileIndexes) {
                const invalidIndex = doc.fileIndexes.find(
                    i => !uploadedFiles[i]
                );

                if (invalidIndex !== undefined) {
                    return responseFormatter.error(
                        req,
                        res,
                        400,
                        MSG.KYB_INVALID_FILE_INDEX
                    );
                }
            }
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        /*
         * MAP DOCUMENTS
         */
        // const mappedDocs = documents.map(doc => ({
        //     type: normalizeDocType(doc.type),
        //     documentNumber: doc.documentNumber?.trim() || "",
        //     issueDate: doc.issueDate || null,
        //     expiryDate: doc.expiryDate || null,
        //     status: "UPLOADED",
        //     uploadedAt: new Date(),
        //     uploadedBy: user._id,
        //     files: (doc.fileIndexes || [])
        //         .map(i => uploadedFiles[i])
        //         .filter(Boolean)
        //         .map(file =>
        //             `${baseUrl}/${file.path.replace(/\\/g, "/")}`
        //         )
        // }));

        const mappedDocs = documents.map(doc => {

            /**
             * NEWLY UPLOADED FILES
             */
            const uploadedUrls = (doc.fileIndexes || [])
                .map(i => uploadedFiles[i])
                .filter(Boolean)
                .map(file =>
                    `${baseUrl}/${file.path.replace(/\\/g, "/")}`
                );

            /**
             * EXISTING FILE URLS
             */
            const existingFiles =
                Array.isArray(doc.existingFiles)
                    ? doc.existingFiles
                    : [];

            return {
                type: normalizeDocType(doc.type),

                documentNumber:
                    doc.documentNumber?.trim() || "",

                issueDate:
                    doc.issueDate || null,

                expiryDate:
                    doc.expiryDate || null,

                status: "UPLOADED",

                uploadedAt: new Date(),

                uploadedBy: user._id,

                /**
                 * PRIORITY:
                 * 1️⃣ NEW FILES
                 * 2️⃣ EXISTING FILES
                 */
                files:
                    uploadedUrls.length > 0
                        ? uploadedUrls
                        : existingFiles
            };
        });

        /*
         * DUPLICATE CHECK
         */
        for (const doc of mappedDocs) {
            if (!doc.documentNumber) continue;

            const exists = await TenantKYB.findOne({
                tenantId: { $ne: tenantId },
                documents: {
                    $elemMatch: {
                        type: doc.type,
                        documentNumber: doc.documentNumber
                    }
                }
            });

            if (exists) {
                return responseFormatter.error(
                    req,
                    res,
                    400,
                    MSG.KYB_DOC_DUPLICATE
                );
            }
        }

        /*
         * FIND OR CREATE KYB
         */
        let kyb = await TenantKYB.findOne({ tenantId });

        if (!kyb) {
            kyb = new TenantKYB({
                tenantId,
                documents: [],
                status: "PENDING"
            });
        }

        mappedDocs.forEach(newDoc => {

            const index = kyb.documents.findIndex(
                d => normalizeDocType(d.type) === newDoc.type
            );

            //UPDATE EXISTING DOCUMENT
            if (index > -1) {

                const oldDoc = kyb.documents[index];

                /**
                 * MERGE OLD + NEW FILES
                 */
                const mergedFiles = [
                    ...(oldDoc.files || []),
                    ...(newDoc.files || [])
                ];

                /**
                 * REMOVE DUPLICATES
                 */
                const uniqueFiles =
                    [...new Set(mergedFiles)];


                const isApproved = kyb.documents[index].status === "APPROVED";

                kyb.documents[index].set({
                    ...newDoc,

                    // 🔒 LOCK STATUS IF APPROVED
                    status: isApproved ? "APPROVED" : newDoc.status,

                    files: uniqueFiles,
                    updatedAt: new Date()
                });

            } else {
                // NEW DOCUMENT
                kyb.documents.push(newDoc);
            }
        });

        // CHECK REQUIRED DOCUMENTS

        const uploadedTypes = kyb.documents.map(doc =>
            normalizeDocType(doc.type)
        );

        const missingRequiredDocs = requiredTypes.filter(
            type => !uploadedTypes.includes(type)
        );

        /*
         * MAIN KYB STATUS
         * PENDING => IF REQUIRED DOCS ARE MISSING
         * UPLOADED => ALL REQUIRED DOCS ARE AVAILABLE
         */
        kyb.status =
            missingRequiredDocs.length > 0
                ? "PENDING"
                : "UPLOADED";

        kyb.lastUploadedAt = new Date();

        kyb.submittedBY = req.user

        kyb.submittedByUserType = user.userType

        kyb.submittedByUserType = user.userType;


        kyb.submittedByModel =
            user.userType === 'ROOT'
                ? 'SYS_User'
                : 'Tenant_Admin';

        await kyb.save();

        /*
         * UPDATE TENANT KYB STATUS
         */
        await Tenant.findByIdAndUpdate(tenantId, {
            $set: {
                kybStatus: kyb.status
            }
        });

        /*
         * AUDIT LOG
         */
        await auditLogger?.({
            req,
            user,
            action: "KYB_UPLOAD",
            module: "KYB",
            entityId: kyb._id,
            entityName: tenantId,
            after: kyb
        });

        return responseFormatter.success(
            req,
            res,
            MSG.KYB_UPLOADED,
            {
                ...localizeKYB(kyb, lang),
                missingRequiredDocs
            },
            null,
            201,

        );

    } catch (err) {
        console.error(JSON.stringify(err));

        return responseFormatter.error(
            req,
            res,
            500,
            MSG.KYB_UPLOAD_FAILED
        );
    }
};


/* ============================================================
VIEW ALL NEWLY UPLOADED KYB LIST
============================================================ */

exports.ListTenantKYB = async (req, res) => {
    try {

        const lang = req.lang || DEFAULT_LANG;

        // Optional filters
        const { status } = req.query;

        /* =========================
           FILTER
        ========================= */
        const filter = {};

        // Default only uploaded
        filter.status = status || "UPLOADED";

        /* =========================
           FETCH KYB LIST
        ========================= */
        const kybList = await TenantKYB.find(filter)
            .select('-documents')
            .populate(
                'tenantId',
                'companyName'
            )
            .populate(
                'submittedBY',
                'name email'
            )
            .sort({ createdAt: -1 })
            .lean();
        /* =========================
           LOCALIZE DATA
        ========================= */
        const localizedData = kybList.map((item) =>
            localizeKYB(item, lang)
        );

        return responseFormatter.success(
            req,
            res,
            MSG.KYB_FETCHED,
            localizedData,
            {
                total: localizedData.length
            },
            201,
            null
        );

    } catch (err) {
        console.error(err);

        return responseFormatter.error(
            req,
            res,
            500,
            MSG.KYB_FETCH_FAILED
        );
    }
};

/* ============================================================
VIEW TENANT KYB
============================================================ */
// Old
// exports.viewTenantKYB = async (req, res) => {
//     try {

//         const lang = req.lang || DEFAULT_LANG;
//         const user = req.user;
//         const { tenantId } = req.params;

//         if (!tenantId) {
//             return responseFormatter.error(req, res, 400, MSG.KYB_TENANT_ID_REQUIRED);
//         }

//         const tenant = await Tenant.findById(tenantId);

//         if (!tenant) {
//             return responseFormatter.error(
//                 req,
//                 res,
//                 404,
//                 MSG.TENANT_NOT_FOUND
//             );
//         }

//         const kyb = await TenantKYB.findOne({ tenantId })
//             .populate("tenantId", "companyName contact.email contact.phone, logo")
//         // .populate("verifiedBy", "name email")
//         .lean();

//          /*
//          * FETCH ACTIVE KYB DOC TYPES
//          */
//         const kybDocTypes = await KYBDocType.find({
//             isEnabled: true,
//             isDeleted: false
//         }).lean();

//         if (!kybDocTypes) {
//             return responseFormatter.error(req, res, 404, MSG.KYB_NOT_FOUND);
//         }

//         return responseFormatter.success(
//             req,
//             res,
//             MSG.KYB_FETCHED,
//             localizeKYB(kyb, lang),
//             null,
//             200
//         );

//     } catch (err) {
//         console.error(err);
//         return responseFormatter.error(req, res, 500, MSG.KYB_FETCH_FAILED);
//     }
// };

// New but not working for detail page
exports.viewTenantKYB = async (req, res) => {
    try {
        const lang = req.lang || DEFAULT_LANG;
        const user = req.user;
        const { tenantId } = req.params;

        if (!tenantId) {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.KYB_TENANT_ID_REQUIRED
            );
        }

        /*
         * CHECK TENANT
         */
        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.TENANT_NOT_FOUND
            );
        }

        /*
         * FETCH TENANT KYB
         */
        const kyb = await TenantKYB.findOne({ tenantId })
            .populate(
                "tenantId",
                "companyName contact.email contact.phone logo"
            )
            .lean();

        /*
         * FETCH ACTIVE KYB DOC TYPES
         */
        const kybDocTypes = await KYBDocType.find({
            isEnabled: true,
            isDeleted: false,
        }).lean();

        if (!kybDocTypes || kybDocTypes.length === 0) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.KYB_NOT_FOUND
            );
        }

        /*
         * MAP DOCUMENT LABELS
         */
        const formattedDocuments = kybDocTypes.map((docType) => {
            // Find uploaded document by type
            const uploadedDoc =
                kyb?.documents?.find(
                    (doc) => doc.type === docType.type
                ) || null;

            return {
                type: docType.type,
                label:
                    docType?.label?.[lang] ||
                    docType?.label?.[DEFAULT_LANG] ||
                    "",
                description:
                    docType?.description?.[lang] ||
                    docType?.description?.[DEFAULT_LANG] ||
                    "",
                isRequired: docType.isRequired,
                documentId: uploadedDoc?._id || null,
                documentNumber:
                    uploadedDoc?.documentNumber || "",
                status:
                    uploadedDoc?.status || "PENDING",
                issueDate:
                    uploadedDoc?.issueDate || null,
                expiryDate:
                    uploadedDoc?.expiryDate || null,
                files: uploadedDoc?.files || [],
                reviewedBy:
                    uploadedDoc?.reviewedBy || null,
                reviewedAt:
                    uploadedDoc?.reviewedAt || null,
                createdAt:
                    uploadedDoc?.createdAt || null,
                updatedAt:
                    uploadedDoc?.updatedAt || null,
            };
        });

        /*
         * FINAL RESPONSE
         */
        const responseData = {
            ...kyb,
            documents: formattedDocuments,
        };

        return responseFormatter.success(
            req,
            res,
            MSG.KYB_FETCHED,
            localizeKYB(responseData, lang),
            null,
            200
        );
    } catch (err) {
        console.error(err);

        return responseFormatter.error(
            req,
            res,
            500,
            MSG.KYB_FETCH_FAILED
        );
    }
};



/* ============================================================
DELETE DOCUMENT
============================================================ */

exports.deleteTenantKYBDocument = async (req, res) => {
    try {

        const lang = req.lang || DEFAULT_LANG;
        const user = req.user;
        const { tenantId, documentId } = req.body;

        if (!tenantId || !documentId) {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.KYB_IDS_REQUIRED
            );
        }

        /*
         * FIND KYB
         */
        const kyb = await TenantKYB.findOne({ tenantId });

        if (!kyb) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.KYB_NOT_FOUND
            );
        }

        /*
         * FIND DOCUMENT
         */
        const doc = kyb.documents.id(documentId);

        if (!doc) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.KYB_DOCUMENT_NOT_FOUND
            );
        }

        /*
         * DELETE DOCUMENT
         */
        kyb.documents.pull(documentId);

        /*
         * FETCH ACTIVE KYB DOC TYPES
         */
        const kybDocTypes = await KYBDocType.find({
            isEnabled: true,
            isDeleted: false
        }).lean();

        /*
         * REQUIRED TYPES
         */
        const requiredTypes = kybDocTypes
            .filter(doc => doc.isRequired)
            .map(doc => normalizeDocType(doc.type));

        /*
         * CURRENT UPLOADED TYPES
         */
        const uploadedTypes = kyb.documents.map(doc =>
            normalizeDocType(doc.type)
        );

        /*
         * CHECK MISSING REQUIRED DOCS
         */
        const missingRequiredDocs = requiredTypes.filter(
            type => !uploadedTypes.includes(type)
        );

        /*
         * UPDATE KYB STATUS
         */
        kyb.status =
            missingRequiredDocs.length > 0
                ? "PENDING"
                : "UPLOADED";

        kyb.updatedAt = new Date();

        await kyb.save();

        /*
         * UPDATE TENANT STATUS
         */
        await Tenant.findByIdAndUpdate(tenantId, {
            $set: {
                kybStatus: kyb.status
            }
        });

        /*
         * AUDIT LOG
         */
        await auditLogger?.({
            req,
            user,
            action: "KYB_DOCUMENT_DELETE",
            module: "KYB",
            entityId: kyb._id,
            entityName: tenantId,
            after: kyb
        });

        return responseFormatter.success(
            req,
            res,
            MSG.KYB_DOCUMENT_DELETED,
            {
                ...localizeKYB(kyb, lang),
                missingRequiredDocs
            },
            null,
            200
        );

    } catch (err) {
        console.error(err);

        return responseFormatter.error(
            req,
            res,
            500,
            MSG.KYB_DELETE_FAILED
        );
    }
};

/* ============================================================
🗑️ DELETE FILE
============================================================ */

exports.deleteTenantKYBFile = async (req, res) => {
    try {

        const lang = req.lang || DEFAULT_LANG;
        const user = req.user;
        const { tenantId, documentId, fileId } = req.body;

        if (!tenantId || !documentId || fileId === undefined) {
            return responseFormatter.error(
                req,
                res,
                400,
                MSG.KYB_FILE_IDS_REQUIRED
            );
        }

        const kyb = await TenantKYB.findOne({ tenantId });

        if (!kyb) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.KYB_NOT_FOUND
            );
        }

        const doc = kyb.documents.id(documentId);

        if (!doc) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.KYB_DOCUMENT_NOT_FOUND
            );
        }

        const index = Number(fileId);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= doc.files.length
        ) {
            return responseFormatter.error(
                req,
                res,
                404,
                MSG.KYB_FILE_NOT_FOUND
            );
        }

        /**
         * REMOVE FILE
         */
        doc.files.splice(index, 1);

        /**
         * IF NO FILES LEFT → DELETE DOCUMENT
         */
        if (!doc.files || doc.files.length === 0) {
            kyb.documents.pull(documentId);
        }

        /**
         * FETCH KYB DOC CONFIG
         */
        const kybDocTypes = await KYBDocType.find({
            isEnabled: true,
            isDeleted: false
        }).lean();

        const requiredTypes = kybDocTypes
            .filter(t => t.isRequired)
            .map(t => normalizeDocType(t.type));

        const uploadedTypes = kyb.documents.map(d =>
            normalizeDocType(d.type)
        );

        const missingRequiredDocs = requiredTypes.filter(
            type => !uploadedTypes.includes(type)
        );

        /**
         * STATUS RE-EVALUATION
         */
        if (kyb.documents.length === 0) {
            kyb.status = "PENDING";
        } else if (missingRequiredDocs.length > 0) {
            kyb.status = "PENDING";
        }
        // else {
        //     kyb.status = "UPLOADED";
        // }

        kyb.updatedAt = new Date();

        await kyb.save();

        /**
         * UPDATE TENANT STATUS
         */
        await Tenant.findByIdAndUpdate(tenantId, {
            $set: {
                kybStatus: kyb.status
            }
        });

        /**
         * AUDIT LOG
         */
        await auditLogger?.({
            req,
            user,
            action: "KYB_FILE_DELETE",
            module: "KYB",
            entityId: kyb._id,
            entityName: tenantId,
            after: kyb
        });

        return responseFormatter.success(
            req,
            res,
            MSG.KYB_FILE_DELETED,
            {
                ...localizeKYB(kyb, lang),
                missingRequiredDocs
            },
            null,
            200
        );

    } catch (err) {
        console.error(err);

        return responseFormatter.error(
            req,
            res,
            500,
            MSG.KYB_FILE_DELETE_FAILED
        );
    }
};

/* ============================================================
Update Document Status
============================================================ */

exports.updateKYBDocumentStatus = async (req, res) => {
    try {
        const user = req.user;
        if (!user?._id) {
            return responseFormatter.error(req, res, 401, MSG.AUTH_TOKEN_INVALID);
        }

        const { tenantId, documentId, status, public_comment, internal_comment } = req.body;

        const ALLOWED_STATUSES = ["APPROVED", "REJECTED", "SUSPENDED"];

        if (!tenantId || !documentId || !status) {
            return responseFormatter.error(req, res, 400, MSG.KYB_IDS_REQUIRED);
        }

        if (!ALLOWED_STATUSES.includes(status)) {
            return responseFormatter.error(req, res, 400, MSG.KYB_INVALID_STATUS);
        }

        // comment required for reject/suspend
        if (["REJECTED", "SUSPENDED"].includes(status) && !public_comment) {
            return responseFormatter.error(req, res, 400, MSG.KYB_COMMENT_REQUIRED);
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return responseFormatter.error(req, res, 404, MSG.TENANT_NOT_FOUND);
        }

        if (tenant.status !== "ACTIVE") {
            return responseFormatter.error(req, res, 400, MSG.TENANT_NOT_ACTIVE);
        }

        const kyb = await TenantKYB.findOne({ tenantId });
        if (!kyb) {
            return responseFormatter.error(req, res, 404, MSG.KYB_NOT_FOUND);
        }

        const doc = kyb.documents.id(documentId);
        if (!doc) {
            return responseFormatter.error(req, res, 404, MSG.KYB_DOCUMENT_NOT_FOUND);
        }

        // ✅ deep clone BEFORE state
        const beforedoc = doc.toObject();

        // 🚫 prevent any change after approval
        if (doc.status === "APPROVED") {
            return responseFormatter.error(req, res, 400, MSG.KYB_ALREADY_APPROVED);
        }

        doc.status = status;
        doc.reviewedBy = user._id;
        doc.reviewedAt = new Date();
        doc.public_comment = public_comment || "";
        doc.internal_comment = internal_comment || "";

        // ✅ Sync KYB status
        const T_KYBStats = updateKYBStatus(kyb);

        await Tenant.findByIdAndUpdate(tenantId, {
            $set: { kybStatus: T_KYBStats }
        });

        await kyb.save();

        await auditLogger?.({
            req,
            user,
            action: `KYB_DOC_${status}`,
            module: "KYB",
            entityId: kyb._id,
            entityName: tenantId,
            before: beforedoc,
            after: doc
        });

        return responseFormatter.success(
            req,
            res,
            MSG.KYB_STATUS_UPDATED,
            kyb,
            null,
            201
        );

    } catch (err) {
        console.error(err);
        return responseFormatter.error(req, res, 520, MSG.KYB_ACTION_FAILED);
    }
};
