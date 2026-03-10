require("dotenv").config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const moduleRoutes = require('./routes/rootmodule.routes'); // Root system module routes
const seedSuperAdmin = require('./script/seedDefaultValue'); // Seed default root admin + base data
const languageMiddleware = require('./middleware/languageMiddleware'); // Multi-language middleware
const { swaggerUi, specs } = require('./swagger'); // Swagger documentation

const app = express();

// ======================
// 🔌 Database Connection
// ======================
require("./config/db");  // Initialize MongoDB connection

// ======================
// 🌱 Seed Default Data (Dev Only)
// ======================
if (process.env.NODE_ENV === 'development') {
  seedSuperAdmin(); // Auto-create super admin & base config in dev
}

// ======================
// 🌐 Global Middlewares
// ======================
app.use(cors());               // Enable CORS for cross-origin requests
app.use(express.json());       // Parse incoming JSON payloads
app.use(morgan('dev'));        // HTTP request logging
app.use(languageMiddleware);   // Attach i18n helpers (req.lang, req.t)

// ======================
// 🔐 SUPER ADMIN ROUTES
// ======================
app.use('/api/auth', require('./routes/auth.routes'));               // Authentication routes
app.use('/api/profile', require('./routes/adminProfile.routes'));   // Logged-in admin profile
app.use('/api/systemmodules', require('./routes/rootmodule.routes')); // Root system modules
app.use('/api/roles', require('./routes/role.routes'));              // Role & permission management
app.use('/api/systemusers', require('./routes/user.routes'));        // System user management
app.use('/api/plans', require('./routes/plan.routes'));        // Sbscription Plans management for affiliates
app.use('/api/affilaite', require('./routes/affiliate.routes'));        // Affiliates management
app.use('/api/cms', require('./routes/cms.routes')); // CMS management
app.use('/api/audit-logs', require('./routes/auditlog.routes')); // Activity/Audit logs

// ======================
// 🏠 Health Check Route
// ======================
app.get('/', (req, res) => {
  res.send('APIs are running...'); // Simple health/status endpoint
});

// ======================
// 📚 Swagger Documentation
// ======================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 30px 0 }
  `,
  customSiteTitle: "MKAdmin APIs Documentation"
}));


// ======================
// 🚀 Start Server
// ======================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT); // Log server start
});
