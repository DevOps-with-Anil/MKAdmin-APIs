const { translate, SUPPORTED_LANGS, DEFAULT_LANG } = require('../utils/i18n');

// =========================================
// 🌐 Internationalization (i18n) Middleware
// =========================================
// Detects request language and injects
// translation helper into request object.

module.exports = (req, res, next) => {
  // Read language from headers (priority order)
  let lang =
    req.headers['accept-language'] || // Standard browser language header
    req.headers['x-lang'] ||           // Custom language header from client
    DEFAULT_LANG;                      // Fallback default language

  // Normalize language code (e.g. en-US → en)
  lang = lang.toLowerCase().split(',')[0].split('-')[0];

  // Validate against supported languages
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = DEFAULT_LANG; // Fallback if unsupported
  }

  // Attach detected language to request
  req.lang = lang;

  // Attach translation helper function to request
  req.t = (key) => translate(lang, key);

  // Set response headers for client awareness
  res.setHeader('Content-Language', lang); // Current response language
  res.setHeader('X-RTL', lang === 'ar' ? '1' : '0'); // RTL indicator for UI

  next(); // Continue to next middleware
};
