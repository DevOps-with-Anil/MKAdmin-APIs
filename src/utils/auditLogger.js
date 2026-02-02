const AuditLog = require('../models/AuditLog');

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
      user: user?._id,
      userEmail: user?.email,

      action,
      module,

      entityId,
      entityName,

      before,
      after,

      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],

      device: req.device || {},

      status,
      message
    });
  } catch (err) {
    // ❌ Never break main flow because of audit
    console.error('Audit log failed:', err.message);
  }
};
