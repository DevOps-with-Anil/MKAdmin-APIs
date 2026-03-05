require("dotenv").config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
<<<<<<< HEAD
const seedSuperAdmin = require('./script/seedDefaultValue');
const languageMiddleware = require('./middleware/languageMiddleware');
const { connectRedis } = require('./config/redis');

const app = express();

// Database & Redis
require("./config/db");
connectRedis().catch(err => console.error('Redis connection failed:', err));
=======
const moduleRoutes = require('./routes/rootmodule.routes'); // Root system module routes
const seedSuperAdmin = require('./script/seedDefaultValue'); // Seed default root admin + base data
const languageMiddleware = require('./middleware/languageMiddleware'); // Multi-language middleware

const app = express();

// ======================
// 🔌 Database Connection
// ======================
require("./config/db");  // Initialize MongoDB connection
>>>>>>> fdd2b4374e32b4d66ad0326fd5ca12610c1db2d3

// Seed Dev Data
if (process.env.NODE_ENV === 'development') seedSuperAdmin();

<<<<<<< HEAD
// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(languageMiddleware);

// Routes (Rate limiter applied inside route files)
app.use('/api/auth', require('./routes/auth/auth.routes'));
app.use('/api/systemmodules', require('./routes/rbac/systemmodule.routes'));
app.use('/api/roles', require('./routes/rbac/systemrole.routes'));
app.use('/api/systemusers', require('./routes/platform/user.routes'));
app.use('/api/profile', require('./routes/platform/adminProfile.routes'));
app.use('/api/plans', require('./routes/subscriptions/plan.routes'));
app.use('/api/affiliate', require('./routes/tenants/affiliate.routes'));

// Health Check
app.get('/', (req, res) => res.send('APIs are running...'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port', PORT));
=======
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

// ======================
// 🏠 Health Check Route
// ======================
app.get('/', (req, res) => {
  res.send('APIs are running...'); // Simple health/status endpoint
});


// ======================
// 🚀 Start Server
// ======================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT); // Log server start
});
>>>>>>> fdd2b4374e32b4d66ad0326fd5ca12610c1db2d3
