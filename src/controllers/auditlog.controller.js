const AuditLog = require('../models/AuditLog');
const responseFormatter = require('../utils/responseFormatter');
const MSG = require('../config/constants/messageKeys');

/**
 * LIST ACTIVITY LOGS (PAGINATED)
 * Endpoint: GET /api/audit-logs
 */
const listAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      module = '',
      action = '',
      status = '',
      userId = '',
      dateFrom = '',
      dateTo = '',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (module) query.module = String(module).trim().toUpperCase();
    if (action) query.action = String(action).trim().toUpperCase();
    if (status) query.status = String(status).trim().toUpperCase();
    if (userId) query.user = userId;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return responseFormatter.success(
      req,
      res,
      MSG.AUDIT_LOG_LIST_FETCHED,
      logs,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        search,
        module,
        action,
        status,
        userId,
        dateFrom,
        dateTo,
      },
      200
    );
  } catch (err) {
    console.error('List audit logs error:', err);
    return responseFormatter.error(req, res, 500, MSG.AUDIT_LOG_LIST_FAILED);
  }
};

module.exports = {
  listAuditLogs,
};

