const AuditLog = require('../models/AuditLog');

module.exports = async function auditLogger({
  req,                // Express request object (for IP, headers, device info)
  user,               // Authenticated user performing the action
  action,             // Action key (e.g., CREATE_USER, UPDATE_ROLE)
  module,             // Module key (e.g., USERS, ROLES, AUTH)
  entityId = null,    // Affected entity ID (optional)
  entityName = null,  // Affected entity name (optional)
  before = null,      // Snapshot before change (optional)
  after = null,       // Snapshot after change (optional)
  status = 'SUCCESS', // SUCCESS | FAILED
  message = ''        // Optional human-readable message
}) {
  try {
    await AuditLog.create({
      user: user?._id,                         // Reference to User collection
      userEmail: user?.email,                  // Denormalized email for fast audit views
      action,                                  // Action performed
      module,                                  // Module affected
      entityId,                                // Target entity ID
      entityName,                              // Target entity name
      before,                                  // Data before change
      after,                                   // Data after change
      ipAddress: req.ip || req.headers['x-forwarded-for'], // Client IP address
      userAgent: req.headers['user-agent'],                // Client user-agent string
      device: req.device || {},                // Device info from middleware (if any)
      status,                                  // Audit status (SUCCESS / FAILED)
      message                                  // Optional audit message
    });
  } catch (err) {
    console.error('Audit log failed:', err.message); // Never block main flow if audit fails
  }
};
