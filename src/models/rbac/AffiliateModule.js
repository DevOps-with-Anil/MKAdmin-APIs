const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

// =========================================
// 🌍 Multi-language Name Sub-Schema
// =========================================
// const localizedNameSchema = new Schema(
//   {
//     en: { type: String, required: true },
//     fr: { type: String, required: true },
//     ar: { type: String, required: true }
//   },
//   { _id: false }
// );
const localizedNameSchema = new Schema({}, { _id: false, strict: false });


// =========================================
// 🧩 Module Action Schema
// =========================================
const actionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    actionName: {
      type: localizedNameSchema,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true,
    timestamps: true // keep only if needed
  }
);

// =========================================
// 🧩 Affilate Module Schema
// =========================================
const moduleSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true,
      index: true
    },

    moduleName: {
      type: localizedNameSchema,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    actions: [actionSchema],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// =========================================
// ⚡ PERFORMANCE INDEX (recommended)
// =========================================
moduleSchema.index({ "actions.key": 1 });

// =========================================
// 🚀 SAFE EXPORT (no overwrite errors)
// =========================================
module.exports =
  rootDB.models.Tenant_Module ||
  rootDB.model("Tenant_Module", moduleSchema);
