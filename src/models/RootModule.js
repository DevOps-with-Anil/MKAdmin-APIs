// const mongoose = require('mongoose');

// // =========================================
// // 🧩 Root Module & Action Schema
// // =========================================
// // Defines all master system modules and
// // their available actions for RBAC control.

// // Nested schema for module actions
// const actionSchema = new mongoose.Schema(
//   {
//     // Unique action key within module (e.g. CREATE, UPDATE, DELETE)
//     key: { type: String, required: true, uppercase: true },

//     // Human-readable action name (e.g. Create User, Edit Role)
//     actionsname: { type: String, required: true },

//     // Whether this action is currently active
//     isActive: { type: Boolean, default: true }
//   },
//   { _id: true } // Enable _id for action-level tracking
// );

// // Main root module schema
// const moduleSchema = new mongoose.Schema(
//   {
//     // Unique module key (e.g. USERS, ROLES, SYS_USERS)
//     key: { type: String, required: true, uppercase: true },

//     // Human-readable module name (e.g. User Management, Role Management)
//     modulename: { type: String, required: true },

//     // Whether this module is currently active
//     isActive: { type: Boolean, default: true },

//     // List of available actions under this module
//     actions: [actionSchema],

//     // Reference to user who created this module
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
//   },
//   {
//     // Automatically manage createdAt and updatedAt timestamps
//     timestamps: true
//   }
// );

// module.exports = mongoose.model('RootModule', moduleSchema);


// const mongoose = require('mongoose');

// // =========================================
// // 🌍 Multi-language Name Sub-Schema
// // =========================================
// // Standard structure for all display names
// // Supports English, French, Arabic (RTL)
// const localizedNameSchema = new mongoose.Schema(
//   {
//     en: { type: String, required: true }, // English (default / fallback)
//     fr: { type: String, required: true }, // French
//     ar: { type: String, required: true }  // Arabic (RTL)
//   },
//   { _id: false } // Prevent extra _id for name object
// );

// // =========================================
// // 🧩 Root Module Action Schema
// // =========================================
// // Defines actions under each module
// const actionSchema = new mongoose.Schema(
//   {
//     // Unique action key within module (e.g. SYS_ROLE_ADD)
//     key: { type: String, required: true, uppercase: true },

//     // Multi-language human-readable action name
//     // Example: { en: 'Add Role', fr: 'Ajouter un rôle', ar: 'إضافة دور' }
//     actionName: {
//       type: localizedNameSchema,
//       required: true
//     },

//     // Whether this action is currently active
//     isActive: { type: Boolean, default: true }
//   },
//   {
//     _id: true, // Enable _id for action-level tracking & audit
//     timestamps: true // Optional: track action updates separately
//   }
// );

// // =========================================
// // 🧩 Root Module Schema
// // =========================================
// // Defines all master system modules
// const moduleSchema = new mongoose.Schema(
//   {
//     // Unique module key (e.g. SYS_MODULES, SYS_ROLES)
//     key: { type: String, required: true, uppercase: true, unique: true },

//     // Multi-language human-readable module name
//     // Example: { en: 'System Roles', fr: 'Rôles système', ar: 'أدوار النظام' }
//     moduleName: {
//       type: localizedNameSchema,
//       required: true
//     },

//     // Whether this module is currently active
//     isActive: { type: Boolean, default: true },

//     // List of available actions under this module
//     actions: [actionSchema],

//     // Reference to user who created this module
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
//   },
//   {
//     // Automatically manage createdAt and updatedAt timestamps
//     timestamps: true
//   }
// );

// module.exports = mongoose.model('RootModule', moduleSchema);



const mongoose = require("mongoose");
const { rootDB } = require("../config/db");

const { Schema } = mongoose;

// =========================================
// 🌍 Multi-language Name Sub-Schema
// =========================================
const localizedNameSchema = new Schema(
  {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    ar: { type: String, required: true }
  },
  { _id: false }
);

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
  rootDB.models.RootModule ||
  rootDB.model("RootModule", moduleSchema);
