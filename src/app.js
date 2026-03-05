require("dotenv").config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const seedSuperAdmin = require('./script/seedDefaultValue');
const languageMiddleware = require('./middleware/languageMiddleware');
const { connectRedis } = require('./config/redis');

const app = express();

// Database & Redis
require("./config/db");
connectRedis().catch(err => console.error('Redis connection failed:', err));

// Seed Dev Data
if (process.env.NODE_ENV === 'development') seedSuperAdmin();

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