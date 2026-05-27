
// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
// const seedSuperAdmin = require("./script/seedDefaultValue");
// const languageMiddleware = require("./middleware/languageMiddleware");
// const { connectRedis } = require("./config/redis");
// const Tenant = require("./models/tenants/Tenant");
// const app = express();
// const path = require('path');



// /**
//  * =====================================================
//  * Database & Redis
//  * =====================================================
//  */

// require("./config/db");

// connectRedis().catch(err =>
//   console.error("Redis connection failed:", err)
// );


// /**
//  * =====================================================
//  * Seed Dev Data
//  * =====================================================
//  */
// seedSuperAdmin();

// /**
//  * =====================================================
//  * Dynamic CORS (Supports Multiple Tenant Domains)
//  * =====================================================
//  */
// app.use(
//   cors({
//     origin: async function (origin, callback) {
//       // allow server-to-server / Postman
//       if (!origin) return callback(null, true);
//       try {
//         const domain = new URL(origin).hostname;
//         const tenant = await Tenant.findOne({ domain });
//         if (
//           tenant ||
//           domain === "dev.rui.plf.mkelefa.net" ||
//           domain === "localhost" 
//         ) {
//           return callback(null, true);  
//         }
//         return callback(new Error("Domain not allowed by CORS"));
//       } catch (err) {
//         return callback(new Error("Invalid origin"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );

// app.options("*", cors());

// /**
//  * =====================================================
//  * Global Middlewares
//  * =====================================================
//  */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(morgan("dev"));
// app.use(languageMiddleware);


// /**
//  * =====================================================
//  * Routes
//  * =====================================================
//  */

// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(
//     "/uploads",
//     express.static(path.join(process.cwd(), "uploads"))
// );
// app.use("/api/auth", require("./routes/auth/auth.routes"));
// app.use("/api/systemmodule", require("./routes/rbac/systemmodule.routes"));
// app.use("/api/tenantmodule", require("./routes/rbac/tenantmodule.routes"));
// app.use("/api/role", require("./routes/rbac/systemrole.routes"));
// app.use("/api/rootadmin", require("./routes/rbac/rootadmin.routes"));
// app.use("/api/plan", require("./routes/subscriptions/plan.routes"));
// app.use("/api/affiliate", require("./routes/tenants/tenants.routes"));
// app.use("/api/tenantrole", require("./routes/affiliates/rbac/tenantrole.routes"));
// app.use("/api/tenantadmin", require("./routes/affiliates/rbac/tenantadmin.routes"));
// app.use("/api/tenant-subscriptions", require("./routes/subscriptions/tenantsubscription.route"));
// app.use("/api/tenantkyb", require("./routes/tenants/tenantkyb.routes"));
// app.use("/api/kybdoc", require("./routes/settings/kybtype.routes"));


// /**
//  * =====================================================
//  * Health Check
//  * =====================================================
//  */
// app.get("/", (req, res) => {
//   res.send("APIs are running on new server....");
// });

// /**
//  * =====================================================
//  * Global Error Handler
//  * =====================================================
//  */
// app.use((err, req, res, next) => {
//   console.error("Global error:", err);
//   res.status(err.status || 500).json({
//     message: err.message || "Internal Server Error"
//   });
// });

// /**
//  * =====================================================
//  * Start Server
//  * =====================================================
//  */
// const PORT = process.env.PORT;
// app.listen(PORT, '0.0.0.0', () =>
//   console.log("Server running on port", PORT)
// );


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const seedSuperAdmin = require("./script/seedDefaultValue");
const languageMiddleware = require("./middleware/languageMiddleware");

const {
  connectRedis,
  redisClient
} = require("./config/redis");

const Tenant = require("./models/tenants/Tenant");

const app = express();

const path = require("path");

/**
 * =====================================================
 * Database & Redis
 * =====================================================
 */

require("./config/db");

connectRedis().catch((err) =>
  console.error("Redis connection failed:", err)
);

/**
 * =====================================================
 * Seed Dev Data
 * =====================================================
 */

seedSuperAdmin();

/**
 * =====================================================
 * Dynamic CORS (Supports Multiple Tenant Domains)
 * =====================================================
 */

app.use(
  cors({
    origin: async function (origin, callback) {

      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      try {

        const domain =
          new URL(origin).hostname;

        const tenant =
          await Tenant.findOne({ domain });

        if (
          tenant ||
          domain === "dev.rui.plf.mkelefa.net" ||
          domain === "localhost"
        ) {
          return callback(null, true);
        }

        return callback(
          new Error("Domain not allowed by CORS")
        );

      } catch (err) {

        return callback(
          new Error("Invalid origin")
        );
      }
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
      "PATCH"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.options("*", cors());

/**
 * =====================================================
 * Global Middlewares
 * =====================================================
 */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(languageMiddleware);

/**
 * =====================================================
 * SESSION + REDIS
 * =====================================================
 */

app.set("trust proxy", 1);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  name: process.env.SESSION_COOKIE_NAME || "connect.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    sameSite: process.env.SESSION_COOKIE_SAME_SITE || "lax",
    domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
    maxAge: Number(process.env.SESSION_COOKIE_MAX_AGE || 600000),
    path: "/"
  },
  rolling: true
}));

/**
 * =====================================================
 * Static Uploads
 * =====================================================
 */

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

/**
 * =====================================================
 * Routes
 * =====================================================
 */

app.use(
  "/api/auth",
  require("./routes/auth/auth.routes")
);

app.use(
  "/api/systemmodule",
  require("./routes/rbac/systemmodule.routes")
);

app.use(
  "/api/tenantmodule",
  require("./routes/rbac/tenantmodule.routes")
);

app.use(
  "/api/role",
  require("./routes/rbac/systemrole.routes")
);

app.use(
  "/api/rootadmin",
  require("./routes/rbac/rootadmin.routes")
);

app.use(
  "/api/plan",
  require("./routes/subscriptions/plan.routes")
);

app.use(
  "/api/affiliate",
  require("./routes/tenants/tenants.routes")
);

app.use(
  "/api/tenantrole",
  require("./routes/affiliates/rbac/tenantrole.routes")
);

app.use(
  "/api/tenantadmin",
  require("./routes/affiliates/rbac/tenantadmin.routes")
);

app.use(
  "/api/tenant-subscriptions",
  require("./routes/subscriptions/tenantsubscription.route")
);

app.use(
  "/api/tenantkyb",
  require("./routes/tenants/tenantkyb.routes")
);

app.use(
  "/api/kybdoc",
  require("./routes/settings/kybtype.routes")
);

/**
 * =====================================================
 * Health Check
 * =====================================================
 */

app.get("/", (req, res) => {

  res.send(
    "APIs are running on new server...."
  );
});

/**
 * =====================================================
 * Global Error Handler
 * =====================================================
 */

app.use((err, req, res, next) => {

  console.error("Global error:", err);

  res.status(err.status || 500).json({
    message:
      err.message ||
      "Internal Server Error"
  });
});

/**
 * =====================================================
 * Start Server
 * =====================================================
 */

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () =>
  console.log(
    "Server running on port",
    PORT
  )
);