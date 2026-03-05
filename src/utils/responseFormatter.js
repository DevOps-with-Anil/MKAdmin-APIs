const MSG = require('../config/constants/messageKeys'); // all message keys
const CODES = require('../config/constants/errorCodes'); // mapping error codes

/**
 * @desc    Send success response
 * @param   {Object} req - Express request object (for i18n)
 * @param   {Object} res - Express response object
 * @param   {String} messageKey - Key from MSG
 * @param   {Object|null} data - Response data
 * @param   {Object|null} meta - Pagination or other meta info
 * @param   {Number} status - HTTP status code (default 200)
 */
exports.success = (req, res, messageKey, data, meta, status) => {

  return res.status(status).json({
    success: true,
    status,
    data,
    meta,
    messageKey,
    message: req.t(messageKey)
  });
};

/**
 * @desc    Send error response
 * @param   {Object} req - Express request object (for i18n)
 * @param   {Object} res - Express response object
 * @param   {Number} status - HTTP status code
 * @param   {String} messageKey - Key from MSG
 * @param   {Object|null} errors - Optional extra error info
 */
exports.error = (req, res, status, messageKey, errCode) => {
  // Auto-map errorCode from MSG key
  let errorCode = errCode || 'USR_500';

  return res.status(status).json({
    success: false,
    status,
    errCode,
    messageKey,
    message: req.t(messageKey),
    });
};
