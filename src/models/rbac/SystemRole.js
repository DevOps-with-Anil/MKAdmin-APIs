const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

// =========================================
// 🌍 Multilingual String Schema
// =========================================
// const localizedNameSchema = new Schema(
//   {
//     en: { type: String, required: true, trim: true },
//     fr: { type: String, trim: true },
//     ar: { type: String, trim: true }
//   },
//   { _id: false }
// );
const localizedNameSchema = new Schema({}, { _id: false, strict: false });


// =========================================
// 🔐 Action Permission Schema
// =========================================
const actionPermissionSchema = new Schema(
  {
    // Example: CREATE, UPDATE, DELETE
    actionKey: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    actionName: {
      type: localizedNameSchema,
      required: true
    },

    allowed: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

// =========================================
// 🧩 Module Permission Schema
// =========================================
const modulePermissionSchema = new Schema(
  {
    // Example: USERS, ROLES, MODULES
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

    allowed: {
      type: Boolean,
      default: false
    },

    actions: {
      type: [actionPermissionSchema],
      default: []
    }
  },
  { _id: false }
);

// =========================================
// 🎭 Role Schema
// =========================================
const roleSchema = new Schema(
  {
    // Multilingual role name
    name: {
      type: localizedNameSchema,
      required: true
    },

    // Multilingual description
    description: {
      type: localizedNameSchema,
      required: true
    },

    // RBAC permissions
    permissions: {
      type: [modulePermissionSchema],
      default: []
    },

    // Active/inactive
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// =========================================
// ⚡ INDEXES
// =========================================

// Unique role name (English)
roleSchema.index({ "name.en": 1 }, { unique: true });

// Faster permission lookup
roleSchema.index({ "permissions.moduleKey": 1 });
roleSchema.index({ "permissions.actions.actionKey": 1 });

// =========================================
// 🚀 SAFE EXPORT (NO OVERWRITE ERROR)
// =========================================
module.exports =
  rootDB.models.SYS_Role ||
  rootDB.model("SYS_Role", roleSchema);
