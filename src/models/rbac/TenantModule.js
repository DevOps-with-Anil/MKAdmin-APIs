const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

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

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },
  },
  {
    _id: true,
    timestamps: true // keep only if needed
  }
);

// =========================================
// 🧩 Root Module Schema
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

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },

    actions: [actionSchema],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User"
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
