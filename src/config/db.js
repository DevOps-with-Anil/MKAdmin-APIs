const mongoose = require("mongoose");

const connections = {};

// =========================================
// 🔎 ENV VALIDATION (VERY IMPORTANT)
// =========================================
if (!process.env.ROOT_DB_URI) {
  throw new Error("❌ ROOT_DB_URI missing in .env");
}

if (!process.env.AFFILIATE_DB_URI) {
  throw new Error("❌ AFFILIATE_DB_URI missing in .env");
}

if (!process.env.AUDITLOG_DB_URI) {
  throw new Error("❌ AUDITLOG_DB_URI missing in .env");
}

// =========================================
// 🧩 ROOT DB
// =========================================
connections.rootDB = mongoose.createConnection(
  process.env.ROOT_DB_URI
);

// =========================================
// 🧩 AFFILIATE DB
// =========================================
connections.affiliateDB = mongoose.createConnection(
  process.env.AFFILIATE_DB_URI
);

// =========================================
// 🧾 AUDIT LOG DB
// =========================================
connections.auditLogDB = mongoose.createConnection(
  process.env.AUDITLOG_DB_URI
);

// =========================================
// 📡 CONNECTION EVENTS
// =========================================
connections.rootDB.on("connected", () => {
  console.log("✅ Root DB connected");
});

connections.affiliateDB.on("connected", () => {
  console.log("✅ Affiliate DB connected");
});

connections.auditLogDB.on("connected", () => {
  console.log("✅ Audit Log DB connected");
});

// Error handlers (important for production)
connections.rootDB.on("error", err =>
  console.error("❌ Root DB error:", err)
);

connections.affiliateDB.on("error", err =>
  console.error("❌ Affiliate DB error:", err)
);

connections.auditLogDB.on("error", err =>
  console.error("❌ AuditLog DB error:", err)
);

module.exports = connections;
