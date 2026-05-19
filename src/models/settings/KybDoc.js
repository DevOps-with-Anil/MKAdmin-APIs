const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

/* ================= MULTILANG SUPPORT ================= */
const localizedSchema = new Schema({}, { _id: false, strict: false });

/* ================= KYB DOC TYPE ================= */
const kybDocTypeSchema = new Schema(
  {
    /* ================= BASIC INFO ================= */
    type: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    label: {
      type: localizedSchema, // 🌐 MULTI LANGUAGE LABEL
      required: true
    },

    description: {
      type: localizedSchema // optional but useful for admin UI/tooltips
    },

    /* ================= CONFIG ================= */
    isEnabled: {
      type: Boolean,
      default: true,
      index: true
    },

    isRequired: {
      type: Boolean,
      default: false
    },

      /* ================= AUDIT ================= */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User"
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User"
    },

    /* ================= SOFT DELETE ================= */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: Date
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
kybDocTypeSchema.index({ type: 1 }, { unique: true });
kybDocTypeSchema.index({ isEnabled: 1, isDeleted: 1 });

module.exports =
  rootDB.models.KYBDocType ||
  rootDB.model("KYBDocType", kybDocTypeSchema);