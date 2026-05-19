
const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

/* =======================
   LOCALIZED FIELD
======================= */
/* ================= MULTILANG ================= */
const localizedSchema = new Schema({}, { _id: false, strict: false });

/* =======================
   DOCUMENT SCHEMA
======================= */
const documentSchema = new Schema(
  {
    type: { type: String, required: true, index: true },

    documentNumber: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "PENDING",
        "UPLOADED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "SUSPENDED"
      ],
      default: "PENDING"
    },

    issueDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },

    files: [{ type: String }],

    public_comment: { type: localizedSchema, default: () => ({}) },
    internal_comment: { type: localizedSchema, default: () => ({}) },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "SYS_User", default: null },
    reviewedAt: { type: Date, default: null }
  },
  { timestamps: true }
);


/* =======================
   KYB SCHEMA
======================= */
const tenantKYBSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      unique: true,
      index: true
    },

    documents: [documentSchema],

    status: {
      type: String,
      enum: [
        "PENDING",
        "UPLOADED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "SUSPENDED"
      ],
      default: "PENDING"
    },

    /* UNIQUE IDS */
    KYBID: { type: String, unique: true, uppercase: true, length: 8 },

    // submittedBY: { type: Schema.Types.ObjectId, ref: "SYS_User", default: null },

    submittedByUserType: { type: String },

    submittedBY: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'submittedByModel'
    },

    submittedByModel: {
      type: String,
      enum: ['SYS_User', 'Tenant_Admin']
    },


    verifiedBy: { type: Schema.Types.ObjectId, ref: "SYS_User", default: null }
  },
  { timestamps: true }
);

tenantKYBSchema.pre("save", async function (next) {
  try {
    // Skip if already exists
    if (this.KYBID) return next();

    const generateId = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";

      for (let i = 0; i < 8; i++) {
        result += chars.charAt(
          Math.floor(Math.random() * chars.length)
        );
      }

      return result;
    };

    let unique = false;

    while (!unique) {
      const newId = generateId();

      const exists = await this.constructor.findOne({
        KYBID: newId
      });

      if (!exists) {
        this.KYBID = newId;
        unique = true;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

/* =======================
   EXPORT
======================= */
module.exports =
  rootDB.models.TenantKYB ||
  rootDB.model("TenantKYB", tenantKYBSchema);