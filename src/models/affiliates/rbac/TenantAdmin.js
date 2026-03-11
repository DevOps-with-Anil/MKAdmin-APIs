const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { affiliateDB } = require("../../../config/db");

const {
  isValidEmail,
  isValidPhone,
  isValidName
} = require("../../../utils/validator");

const { Schema } = mongoose;

// =========================================
// 📱 Device Schema
// =========================================
const deviceSchema = new Schema(
  {
    ipAddress: String,
    userAgent: String,
    deviceType: { type: String, trim: true },
    os: { type: String, trim: true },
    browser: { type: String, trim: true },
    location: {
      country: String,
      region: String,
      city: String
    },
    lastUsedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// =========================================
// 🕘 Login History Schema
// =========================================
const loginHistorySchema = new Schema(
  {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    os: String,
    browser: String,
    location: {
      country: String,
      region: String,
      city: String
    },
    loggedInAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// =========================================
// 👤 Tenant Admin Schema
// =========================================
const tenantAdminSchema = new Schema(
  {
    // Tenant Reference
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: isValidName, message: "Invalid name" }
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: { validator: isValidEmail, message: "Invalid email" }
    },

    phoneCode: { type: String, trim: true },

    phoneNumber: {
      type: String,
      trim: true,
      validate: { validator: isValidPhone, message: "Invalid phone number" }
    },

    userType: {
      type: String,
      enum: ["ROOT", "TENANT"],
      default: "TENANT",
      required: true
    },

    photo: { type: String },

    password: { type: String, required: true, select: true },

    // Role Reference
    role: { type: Schema.Types.ObjectId, ref: "Tenant_Role", required: true },

    allowedCountries: [
      { type: String, uppercase: true, trim: true }
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },

    lastLoginAt: Date,

    // Device Tracking
    currentDevice: deviceSchema,

    // Login History
    loginHistory: [loginHistorySchema],

    // Auth Tokens
    tokens: [
      {
        token: String,
        ipAddress: String,
        userAgent: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Audit Fields
    createdByType: { type: String, enum: ["ROOT", "TENANT"], required: true },
    createdBy: { type: Schema.Types.ObjectId, refPath: "createdByType", required: true }
  },
  { timestamps: true }
);

// =========================================
// 🔹 INDEXES
// =========================================
// Unique email per tenant
tenantAdminSchema.index({ tenantId: 1, email: 1 }, { unique: true });

// Unique phoneNumber per tenant
tenantAdminSchema.index({ tenantId: 1, phoneNumber: 1 }, { unique: true });

// Optional: compound indexes for queries
tenantAdminSchema.index({ tenantId: 1, userType: 1 });
tenantAdminSchema.index({ role: 1 });

// =========================================
// 🔹 PASSWORD HASHING
// =========================================
tenantAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// =========================================
// 🔹 PASSWORD COMPARE METHOD
// =========================================
tenantAdminSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// =========================================
// 🔹 REMOVE SENSITIVE DATA
// =========================================
tenantAdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokens;
  return obj;
};

// =========================================
// 🔹 EXPORT MODEL
// =========================================
module.exports =
  affiliateDB.models.Tenant_Admin ||
  affiliateDB.model("Tenant_Admin", tenantAdminSchema);