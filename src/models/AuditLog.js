const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    userEmail: String, // denormalized for quick view

    action: {
      type: String,
      required: true // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, ASSIGN_ROLE, etc
    },

    module: {
      type: String,
      required: true // USERS, ROLES, MODULES, PERMISSIONS, AUTH, etc
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId // affected record id
    },

    entityName: String, // optional: user name, role name, module name

    before: mongoose.Schema.Types.Mixed, // snapshot before change
    after: mongoose.Schema.Types.Mixed,  // snapshot after change

    ipAddress: String,
    userAgent: String,

    device: {
      browser: String,
      os: String,
      device: String
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS'
    },

    message: String // optional human readable
  },
  { timestamps: true }
);

auditSchema.index({ module: 1, action: 1 });
auditSchema.index({ user: 1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditSchema);
