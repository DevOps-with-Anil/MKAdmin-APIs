const SUPPORTED_LANGS = ['en', 'fr', 'ar'];
const DEFAULT_LANG = 'en';

const translations = {
  en: require('../i18n/en.json'),
  fr: require('../i18n/fr.json'),
  ar: require('../i18n/ar.json')
};

function translate(lang, key) {
  const dict = translations[lang] || translations[DEFAULT_LANG];

  // Direct flat-key lookup
  let value = dict[key];

  // Fallback to default language
  if (!value && lang !== DEFAULT_LANG) {
    value = translations[DEFAULT_LANG][key];
  }

  return value || key;
}

module.exports = {
  translate,
  SUPPORTED_LANGS,
  DEFAULT_LANG
};
