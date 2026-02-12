const mongoose = require('mongoose');

// =========================================
// 🌍 Multi-language Name Sub-Schema
// =========================================
const localizedNameSchema = new mongoose.Schema(
  {
    en: { type: String, required: true }, // English (default)
    fr: { type: String, required: true }, // French
    ar: { type: String, required: true }  // Arabic (RTL)
  },
  { _id: false } // No _id for name objects
);

// =========================================
// 🧩 Plan Module Action Schema
// =========================================
const planActionSchema = new mongoose.Schema(
  {
    actionKey: { type: String, required: true, uppercase: true },   // Action key from RootModule
    actionName: { type: localizedNameSchema, required: true },      // Multi-language action name
    allowed: { type: Boolean, default: false }                      // Is this action allowed in this plan
  },
  { _id: true } // Enable _id for audit/logging
);

// =========================================
// 🧩 Plan Module Schema
// =========================================
const planModuleSchema = new mongoose.Schema(
  {
    moduleKey: { type: String, required: true, uppercase: true },   // Module key from RootModule
    moduleName: { type: localizedNameSchema, required: true },      // Multi-language module name
    actions: [planActionSchema]                                     // Actions in this module for plan
  },
  { _id: true }
);

// =========================================
// 🧩 Plan Schema
// =========================================
const planSchema = new mongoose.Schema(
  {
    // Multi-language plan name
    name: { type: localizedNameSchema, required: true },

    // Multi-language plan description
    description: { type: localizedNameSchema },

    // Price of plan
    price: { type: Number, default: 0 },

    // Currency (ISO 4217) e.g., USD, EUR, INR
    currency: { type: String, default: 'USD', uppercase: true, trim: true },

    // Duration of plan: monthly/yearly
    duration: { type: String, enum: ['MONTHLY', 'YEARLY'], default: 'MONTHLY' },

    // Modules & actions allowed in this plan
    modules: [planModuleSchema],

    // Plan creator (Root admin)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Active/Inactive plan
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
