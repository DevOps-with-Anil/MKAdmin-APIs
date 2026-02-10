const mongoose = require('mongoose');

// =========================================
// 🧩 Root Module & Action Schema
// =========================================
// Defines all master system modules and
// their available actions for RBAC control.

// Nested schema for module actions
const actionSchema = new mongoose.Schema(
  {
    // Unique action key within module (e.g. CREATE, UPDATE, DELETE)
    key: { type: String, required: true, uppercase: true },

    // Human-readable action name (e.g. Create User, Edit Role)
    actionsname: { type: String, required: true },

    // Whether this action is currently active
    isActive: { type: Boolean, default: true }
  },
  { _id: true } // Enable _id for action-level tracking
);

// Main root module schema
const moduleSchema = new mongoose.Schema(
  {
    // Unique module key (e.g. USERS, ROLES, SYS_USERS)
    key: { type: String, required: true, uppercase: true },

    // Human-readable module name (e.g. User Management, Role Management)
    modulename: { type: String, required: true },

    // Whether this module is currently active
    isActive: { type: Boolean, default: true },

    // List of available actions under this module
    actions: [actionSchema],

    // Reference to user who created this module
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true
  }
);

module.exports = mongoose.model('RootModule', moduleSchema);
