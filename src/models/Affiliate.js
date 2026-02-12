const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  isValidEmail,
  isValidPhone,
  isValidName
} = require('../utils/validator');

// ===========================================
// Multi-language schema (EN, FR, AR)
const localizedNameSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    ar: { type: String, required: true } // RTL
  },
  { _id: false }
);

// ===========================================
// 📱 Device Schema
const deviceSchema = new mongoose.Schema(
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
const loginHistorySchema = new mongoose.Schema(
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
// 👤 Affiliate Profile Schema
const affiliateProfileSchema = new mongoose.Schema(
  {
    email: { 
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: isValidEmail,
        message: 'Invalid email'
      }
    },
    phoneCode: { type: String, trim: true },
    phoneNumber: { 
      type: String, 
      trim: true,
      validate: {
        validator: isValidPhone,
        message: 'Invalid phone'
      }
    },
    password: { type: String, required: true, select: true },
    photo: { type: String },

    // Multi-language fields
    name: { type: localizedNameSchema, required: true },
    companyName: { type: localizedNameSchema },
    bio: { type: localizedNameSchema },

    // Multi-language address
    address: {
      street: { type: localizedNameSchema },
      city: { type: localizedNameSchema },
      state: { type: localizedNameSchema },
      country: { type: localizedNameSchema },
      postalCode: String
    },

    website: { type: String },

    // KYB verification status
    kybVerified: { type: Boolean, default: false },

    // Account status
    status: { type: String, enum: ['ACTIVE','INACTIVE','SUSPENDED'], default: 'ACTIVE' },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // Last login
    lastLoginAt: Date,

    // Device & session tracking
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

    // Audit / ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Root who created this affiliate
    }
  },
  { timestamps: true }
);

// ===========================================
// 🔐 Password Hashing Middleware
affiliateProfileSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ===========================================
// 🔑 Authentication Helpers
affiliateProfileSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ===========================================
// ❌ JSON Transform Helpers
affiliateProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ===========================================
// Soft delete helper
affiliateProfileSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Affiliate', affiliateProfileSchema);
