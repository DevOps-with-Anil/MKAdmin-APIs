require('dotenv').config();

// =========================================
// 🔐 JWT Secret Validation & Fallback
// =========================================
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not found in .env. Using temporary secret for development!');
  console.warn('🔒 WARNING: This is not secure for production!');
}

module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: JWT_SECRET || 'dev-temporary-secret-change-in-production',
  isProduction: process.env.NODE_ENV === 'production'
};
