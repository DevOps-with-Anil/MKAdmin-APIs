const mongoose = require("mongoose");
const { auditLogDB } = require("../config/db");

const { Schema } = mongoose;

// =========================================
// 🧾 Audit Log Schema
// =========================================
const auditSchema = new Schema(
  {
    // User who performed action
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    // Denormalized email (fast reporting)
    userEmail: {
      type: String,
      trim: true,
      lowercase: true
    },

    // Action type (CREATE, UPDATE, DELETE, LOGIN...)
    action: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // Module name (USERS, ROLES, AUTH...)
    module: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // Affected entity ID
    entityId: {
      type: Schema.Types.ObjectId
    },

    // Human readable entity label
    entityName: {
      type: String,
      trim: true
    },

    // Data snapshot before update
    before: Schema.Types.Mixed,

    // Data snapshot after update
    after: Schema.Types.Mixed,

    // Request metadata
    ipAddress: String,
    userAgent: String,

    // Parsed device info
    device: {
      browser: String,
      os: String,
      device: String
    },

    // Result of action
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS"
    },

    // Optional message
    message: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// =========================================
// ⚡ INDEXES (Performance)
// =========================================
auditSchema.index({ module: 1, action: 1 });
auditSchema.index({ user: 1 });
auditSchema.index({ createdAt: -1 });
auditSchema.index({ status: 1 });

// =========================================
// 🚀 SAFE EXPORT (No Overwrite Error)
// =========================================
module.exports =
  auditLogDB.models.AuditLog ||
  auditLogDB.model("AuditLog", auditSchema);
