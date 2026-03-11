const mongoose = require("mongoose");
const { auditLogDB } = require("../../config/db");

const { Schema } = mongoose;

// =========================================
// 🧾 Audit Log Schema
// =========================================
const auditSchema = new Schema(
  {
    // =========================================
    // USER INFORMATION
    // =========================================
    userId: {
      type: Schema.Types.ObjectId
    },

    userType: {
      type: String,
      enum: ["ROOT", "TENANT"],
      required: true
    },

    userModel: {
      type: String,
      enum: ["SYS_User", "Tenant_Admin"]
    },

    userEmail: {
      type: String,
      trim: true,
      lowercase: true
    },

    userRole: {
      type: String,
      trim: true,
      uppercase: true
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant"
    },

    // =========================================
    // ACTION INFORMATION
    // =========================================
    action: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    module: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    entityId: {
      type: Schema.Types.ObjectId
    },

    entityName: {
      type: String,
      trim: true
    },

    // =========================================
    // DATA SNAPSHOTS
    // =========================================
    before: Schema.Types.Mixed,

    after: Schema.Types.Mixed,

    // =========================================
    // EXTRA METADATA
    // =========================================
    meta: Schema.Types.Mixed,

    // =========================================
    // REQUEST METADATA
    // =========================================
    ipAddress: String,

    userAgent: String,

    device: {
      browser: String,
      os: String,
      device: String
    },

    // =========================================
    // RESULT
    // =========================================
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS"
    },

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
auditSchema.index({ userId: 1 });
auditSchema.index({ tenantId: 1 });
auditSchema.index({ userType: 1 });
auditSchema.index({ createdAt: -1 });
auditSchema.index({ status: 1 });

// =========================================
// 🚀 SAFE EXPORT
// =========================================
module.exports =
  auditLogDB.models.AuditLog ||
  auditLogDB.model("AuditLog", auditSchema);