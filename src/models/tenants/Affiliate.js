const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { affiliateDB } = require("../../config/db"); // IMPORTANT

const {
  isValidEmail,
  isValidPhone
} = require("../../utils/validator");

const { Schema } = mongoose;

// ===========================================
// 🌍 Multi-language Schema
// ===========================================
const localizedNameSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    fr: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true }
  },
  { _id: false }
);

// ===========================================
// 📱 Device Schema
// ===========================================
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

// ===========================================
// 🕘 Login History Schema
// ===========================================
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

// ===========================================
// 👤 Affiliate Schema
// ===========================================
const affiliateProfileSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidEmail,
        message: "Invalid email"
      }
    },

    phoneCode: { type: String, trim: true },

    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: isValidPhone,
        message: "Invalid phone"
      }
    },

    password: {
      type: String,
      required: true,
      select: true
    },

    photo: String,

    // Multi-language fields
    name: { type: localizedNameSchema, required: true },
    companyName: localizedNameSchema,
    bio: localizedNameSchema,

    // Multi-language address
    address: {
      street: localizedNameSchema,
      city: localizedNameSchema,
      state: localizedNameSchema,
      country: localizedNameSchema,
      postalCode: String
    },

    website: String,

    // KYB
    kybVerified: {
      type: Boolean,
      default: false
    },

    // Status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: Date,

    lastLoginAt: Date,

    // Session tracking
    currentDevice: deviceSchema,
    loginHistory: [loginHistorySchema],

    tokens: [
      {
        token: String,
        ipAddress: String,
        userAgent: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Root admin creator
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User"
    }
  },
  { timestamps: true }
);

// ===========================================
// ⚡ INDEXES
// ===========================================

// Unique email only for non-deleted users
affiliateProfileSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

affiliateProfileSchema.index({ status: 1 });
affiliateProfileSchema.index({ createdAt: -1 });

// ===========================================
// 🔐 Password Hashing
// ===========================================
affiliateProfileSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ===========================================
// 🔑 Helpers
// ===========================================
affiliateProfileSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

affiliateProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

affiliateProfileSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

// ===========================================
// 🚀 SAFE EXPORT (NO OVERWRITE ERROR)
// ===========================================
module.exports =
  affiliateDB.models.Affiliate ||
  affiliateDB.model("Affiliate", affiliateProfileSchema);
