const AuditLog = require('../models/audit/AuditLog');

module.exports = async function auditLogger({
  req,
  user,
  action,
  module,
  entityId = null,
  entityName = null,
  before = null,
  after = null,
  status = 'SUCCESS',
  message = ''
}) {
  try {
    await AuditLog.create({
      // ===============================
      // USER INFORMATION
      // ===============================
      userId: user?._id || null,
      userType: user?.type || "ROOT",   // ROOT | TENANT | SYSTEM
      userEmail: user?.email || null,
      userRole: user?.role._id || null,
      tenantId: user?.tenantId || null,

      // ===============================
      // ACTION INFORMATION
      // ===============================
      action,
      module,
      entityId,
      entityName,

      // ===============================
      // DATA SNAPSHOT
      // ===============================
      before,
      after,

      // ===============================
      // REQUEST METADATA
      // ===============================
      ipAddress:
        req?.ip ||
        req?.headers?.['x-forwarded-for'] ||
        null,

      userAgent:
        req?.headers?.['user-agent'] ||
        null,

      device: req?.device || {},

      // ===============================
      // RESULT
      // ===============================
      status,
      message
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};
