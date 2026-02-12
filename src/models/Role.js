// const mongoose = require('mongoose');

// // =========================================
// // 🎭 Role & Permission Schema
// // =========================================
// // Defines roles and their module/action
// // level permissions for RBAC system.

// // Nested schema for individual action permissions
// const actionPermissionSchema = new mongoose.Schema(
//   {
//     // Unique action key inside a module (e.g. CREATE, UPDATE, DELETE)
//     actionKey: { type: String, required: true },

//     // Whether this action is allowed for the role
//     allowed: { type: Boolean, default: false }
//   },
//   { _id: false } // Disable _id for cleaner nested documents
// );

// // Nested schema for module-level permissions
// const modulePermissionSchema = new mongoose.Schema(
//   {
//     // Unique module key (e.g. USERS, ROLES, MODULES)
//     moduleKey: { type: String, required: true },

//     // Whether this module is enabled for the role
//     allowed: { type: Boolean, default: false },

//     // List of action-level permissions under this module
//     actions: [actionPermissionSchema]
//   },
//   { _id: false } // Disable _id for cleaner nested documents
// );

// // Main Role schema
// const roleSchema = new mongoose.Schema(
//   {
//     // Unique role name (e.g. Super Admin, Support, Manager)
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true
//     },

//     // Human-readable role description
//     description: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     // Module and action permissions for this role (RBAC core)
//     permissions: {
//       type: [modulePermissionSchema],
//       default: []
//     },

//     // Role active/inactive status flag
//     status: {
//       type: Boolean,
//       default: true
//     }
//   },
//   {
//     // Automatically manage createdAt and updatedAt timestamps
//     timestamps: true
//   }
// );

// // Optional index for faster role lookup by name
// // roleSchema.index({ name: 1 });

// module.exports = mongoose.model('Role', roleSchema);



const mongoose = require('mongoose');

// =========================================
// 🎭 Role & Permission Schema (Multilingual)
// =========================================
// Defines roles and their module/action
// level permissions for RBAC system with i18n.

// Nested schema for individual action permissions
const actionPermissionSchema = new mongoose.Schema(
  {
    // Unique action key inside a module (e.g. CREATE, UPDATE, DELETE)
    actionKey: { type: String, required: true },

    // Whether this action is allowed for the role
    allowed: { type: Boolean, default: false }
  },
  { _id: false }
);

// Nested schema for module-level permissions
const modulePermissionSchema = new mongoose.Schema(
  {
    // Unique module key (e.g. USERS, ROLES, MODULES)
    moduleKey: { type: String, required: true },

    // Whether this module is enabled for the role
    allowed: { type: Boolean, default: false },

    // List of action-level permissions under this module
    actions: [actionPermissionSchema]
  },
  { _id: false }
);

// Multilingual string sub-schema (reusable pattern)
const i18nStringSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true },
    fr: { type: String, trim: true },
    ar: { type: String, trim: true }
  },
  { _id: false }
);

// Main Role schema
const roleSchema = new mongoose.Schema(
  {
    // Multilingual role name
    name: {
      type: i18nStringSchema,
      required: true
    },

    // Multilingual role description
    description: {
      type: i18nStringSchema,
      required: true
    },

    // Module and action permissions for this role (RBAC core)
    permissions: {
      type: [modulePermissionSchema],
      default: []
    },

    // Role active/inactive status flag
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// 🔍 Optional index for faster lookup by English name (common case)
roleSchema.index({ 'name.en': 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
