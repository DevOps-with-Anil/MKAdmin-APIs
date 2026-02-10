const mongoose = require('mongoose');

// =========================================
// 🧾 Audit Log Schema
// =========================================
// Centralized audit trail for tracking all
// critical system and admin activities.

const auditSchema = new mongoose.Schema(
  {
    // Reference to the user who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Denormalized user email for fast reporting
    userEmail: {
      type: String
    },

    // High-level action performed (CREATE, UPDATE, DELETE, LOGIN, etc)
    action: {
      type: String,
      required: true
    },

    // System module where the action occurred (USERS, ROLES, AUTH, etc)
    module: {
      type: String,
      required: true
    },

    // ID of the affected record/entity
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },

    // Human-readable entity identifier (name, email, code, etc)
    entityName: {
      type: String
    },

    // Snapshot of entity data before the change
    before: mongoose.Schema.Types.Mixed,

    // Snapshot of entity data after the change
    after: mongoose.Schema.Types.Mixed,

    // Source IP address of the request
    ipAddress: {
      type: String
    },

    // Raw User-Agent string from client
    userAgent: {
      type: String
    },

    // Parsed device information (browser, OS, device type)
    device: {
      browser: String, // Browser name (Chrome, Firefox, etc)
      os: String,      // Operating system (Windows, macOS, Android, etc)
      device: String   // Device type (desktop, mobile, tablet)
    },

    // Execution status of the action (SUCCESS or FAILED)
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },

    // Optional human-readable audit message
    message: {
      type: String
    }
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Index for fast filtering by module and action
auditSchema.index({ module: 1, action: 1 });

// Index for fast lookup by user
auditSchema.index({ user: 1 });

// Index for efficient sorting by newest records
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditSchema);
