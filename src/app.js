// require("dotenv").config();
// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const seedSuperAdmin = require('./script/seedDefaultValue');
// const languageMiddleware = require('./middleware/languageMiddleware');
// const { connectRedis } = require('./config/redis');

// const app = express();

// // Database & Redis
// require("./config/db");
// connectRedis().catch(err => console.error('Redis connection failed:', err));

// // Seed Dev Data
// if (process.env.NODE_ENV === 'development') seedSuperAdmin();

// // Global Middlewares
// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));
// app.use(languageMiddleware);

// // Routes (Rate limiter applied inside route files)
// app.use('/api/auth', require('./routes/auth/auth.routes'));
// app.use('/api/systemmodule', require('./routes/rbac/systemmodule.routes'));
// app.use('/api/tenantmodule', require('./routes/rbac/tenantmodule.routes'));
// app.use('/api/role', require('./routes/rbac/systemrole.routes'));
// app.use('/api/rootadmin', require('./routes/rbac/rootadmin.routes'));
// app.use('/api/plan', require('./routes/subscriptions/plan.routes'));
// app.use('/api/affiliate', require('./routes/tenants/tenants.routes'));

// app.use('/api/tenantrole', require('./routes/affiliates/rbac/tenantrole.routes'));
// app.use('/api/tenantadmin', require('./routes/affiliates/rbac/tenantadmin.routes'));

// app.use('/api/tenant-subscriptions', require('./routes/subscriptions/tenantsubscription.route'))

// // Health Check
// app.get('/', (req, res) => res.send('APIs are running...'));

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error('Global error:', err);
//   res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
// });

// // Start Server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log('Server running on port', PORT));


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const seedSuperAdmin = require("./script/seedDefaultValue");
const languageMiddleware = require("./middleware/languageMiddleware");
const { connectRedis } = require("./config/redis");

const Tenant = require("./models/tenants/Tenant"); // adjust path if needed

const app = express();

/**
 * =====================================================
 * Database & Redis
 * =====================================================
 */
require("./config/db");

connectRedis().catch(err =>
  console.error("Redis connection failed:", err)
);

/**
 * =====================================================
 * Seed Dev Data
 * =====================================================
 */
if (process.env.NODE_ENV === "development") {
  seedSuperAdmin();
}

/**
 * =====================================================
 * Dynamic CORS (Supports Multiple Tenant Domains)
 * =====================================================
 */
app.use(
  cors({
    origin: async function (origin, callback) {

      // allow server-to-server / Postman
      if (!origin) return callback(null, true);

      try {

        const domain = new URL(origin).hostname;

        const tenant = await Tenant.findOne({ domain });

        if (tenant || domain === "localhost" || "192.168.1.5") {
          return callback(null, true);
        }

        return callback(new Error("Domain not allowed by CORS"));

      } catch (err) {
        return callback(new Error("Invalid origin"));
      }
    },
    credentials: true
  })
);

/**
 * =====================================================
 * Global Middlewares
 * =====================================================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(languageMiddleware);

/**
 * =====================================================
 * Tenant Resolver Middleware
 * =====================================================
 */
app.use(async (req, res, next) => {
  try {
    const host = req.headers.host?.split(":")[0]; // remove port

    if (!host) {
      return res.status(400).json({
        success: false,
        message: "Invalid domain"
      });
    }

    const tenant = await Tenant.findOne({ domain: host });

    // if (!tenant) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Unauthorized Access."
    //   });
    // }

    // attach tenant to request
    req.tenant = tenant;

    next();
  } catch (error) {
    console.error("Tenant resolve error:", error);

    return res.status(500).json({
      success: false,
      message: "Tenant resolution failed"
    });
  }
});

/**
 * =====================================================
 * Routes
 * =====================================================
 */

app.use("/api/auth", require("./routes/auth/auth.routes"));

app.use("/api/systemmodule", require("./routes/rbac/systemmodule.routes"));
app.use("/api/tenantmodule", require("./routes/rbac/tenantmodule.routes"));
app.use("/api/role", require("./routes/rbac/systemrole.routes"));
app.use("/api/rootadmin", require("./routes/rbac/rootadmin.routes"));

app.use("/api/plan", require("./routes/subscriptions/plan.routes"));

app.use("/api/affiliate", require("./routes/tenants/tenants.routes"));

app.use("/api/tenantrole", require("./routes/affiliates/rbac/tenantrole.routes"));
app.use("/api/tenantadmin", require("./routes/affiliates/rbac/tenantadmin.routes"));

app.use(
  "/api/tenant-subscriptions",
  require("./routes/subscriptions/tenantsubscription.route")
);

/**
 * =====================================================
 * Health Check
 * =====================================================
 */
app.get("/", (req, res) => {
  res.send("APIs are running...");
});

/**
 * =====================================================
 * Global Error Handler
 * =====================================================
 */
app.use((err, req, res, next) => {

  console.error("Global error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });

});

/**
 * =====================================================
 * Start Server
 * =====================================================
 */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log("Server running on port", PORT)
);