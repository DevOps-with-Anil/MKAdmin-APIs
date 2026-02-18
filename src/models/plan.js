const mongoose = require("mongoose");
const { rootDB } = require("../config/db");

const { Schema } = mongoose;

// =========================================
// 🌍 Multi-language Name Schema
// =========================================
const localizedNameSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    fr: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true }
  },
  { _id: false }
);

// =========================================
// 🧩 Plan Action Schema
// =========================================
const planActionSchema = new Schema(
  {
    // Action key from RootModule
    actionKey: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // Multi-language action name
    actionName: {
      type: localizedNameSchema,
      required: true
    },

    // Permission flag
    allowed: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

// =========================================
// 🧩 Plan Module Schema
// =========================================
const planModuleSchema = new Schema(
  {
    moduleKey: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    moduleName: {
      type: localizedNameSchema,
      required: true
    },

    actions: {
      type: [planActionSchema],
      default: []
    }
  },
  { _id: true }
);

// =========================================
// 🧩 Plan Schema
// =========================================
const planSchema = new Schema(
  {
    // Multi-language name
    name: {
      type: localizedNameSchema,
      required: true
    },

    // Multi-language description
    description: {
      type: localizedNameSchema
    },

    // Plan price
    price: {
      type: Number,
      default: 0,
      min: 0
    },

    // ISO currency code
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true
    },

    // Billing duration
    duration: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY"
    },

    // Allowed modules & actions
    modules: {
      type: [planModuleSchema],
      default: []
    },

    // Root admin creator
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    // Plan status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

// =========================================
// ⚡ INDEXES (Performance)
// =========================================
planSchema.index({ "name.en": 1 });
planSchema.index({ status: 1 });
planSchema.index({ "modules.moduleKey": 1 });

// =========================================
// 🚀 SAFE EXPORT (No Overwrite Errors)
// =========================================
module.exports =
  rootDB.models.Plan ||
  rootDB.model("Plan", planSchema);
