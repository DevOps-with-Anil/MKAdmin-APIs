const { translate, SUPPORTED_LANGS, DEFAULT_LANG } = require('../utils/i18n');

// =========================================
// 🌐 Internationalization (i18n) Middleware
// =========================================
// Detects request language and injects translation helper into request object.

module.exports = (req, res, next) => {
  let lang =
    req.headers['accept-language'] || 
    req.headers['x-lang'] ||           
    DEFAULT_LANG;                      

  lang = lang.toLowerCase().split(',')[0].split('-')[0];

  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = DEFAULT_LANG; 
  }

  req.lang = lang;

  req.t = (key) => translate(lang, key);

  res.setHeader('Content-Language', lang); 
  res.setHeader('X-RTL', lang === 'ar' ? '1' : '0');

  next(); 
};
