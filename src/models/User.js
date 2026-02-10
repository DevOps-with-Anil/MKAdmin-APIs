const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
  isValidEmail,
  isValidPhone,
  isValidName
} = require('../utils/validator');

// =========================================
// 📱 Device Schema
// =========================================
// Tracks the user's current active device.

const deviceSchema = new mongoose.Schema(
  {
    // IP address of the device
    ipAddress: String,

    // Raw User-Agent string
    userAgent: String,

    // Device type (mobile, desktop, tablet)
    deviceType: {
      type: String,
      trim: true
    },

    // Operating system (iOS, Android, Windows, macOS, Linux)
    os: {
      type: String,
      trim: true
    },

    // Browser name (Chrome, Safari, Firefox, Edge)
    browser: {
      type: String,
      trim: true
    },

    // Approximate geo-location of the device
    location: {
      country: String, // Country code or name
      region: String,  // State/region
      city: String     // City
    },

    // Last time this device was used
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false } // Disable _id for embedded device object
);

// =========================================
// 🕘 Login History Schema
// =========================================
// Stores recent login activity for security.

const loginHistorySchema = new mongoose.Schema(
  {
    // IP address used for login
    ipAddress: String,

    // Raw User-Agent string
    userAgent: String,

    // Device type used during login
    deviceType: String,

    // Operating system used during login
    os: String,

    // Browser used during login
    browser: String,

    // Approximate geo-location during login
    location: {
      country: String, // Country code or name
      region: String,  // State/region
      city: String     // City
    },

    // Timestamp of login
    loggedInAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false } // Disable _id for login history records
);

// =========================================
// 👤 User Schema (ROOT System User)
// =========================================
// Core user model with authentication,
// RBAC, device tracking, and audit fields.

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: { 
      type: String, 
      required: true, 
      trim: true,
      validate: {
        validator: isValidName,
        message: 'Invalid name'
      }
    },

    // Unique email address (used for login)
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

    // Phone country/area code
    phoneCode: { 
      type: String, 
      trim: true 
    },

    // Phone number
    phoneNumber: { 
      type: String, 
      trim: true,
      validate: {
        validator: isValidPhone,
        message: 'Invalid phone'
      } 
    },

    // Profile photo URL or path
    photo: { type: String },

    // =====================================
    // 🔐 Authentication
    // =====================================

    // Hashed user password
    password: {
      type: String,
      required: true,
      select: true
    },

    // =====================================
    // 🎭 RBAC (ROOT Users Only)
    // =====================================

    // Assigned role reference
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },

    // =====================================
    // 🌍 Access Scope / Geography
    // =====================================

    // List of allowed country codes
    allowedCountries: [
      { type: String, uppercase: true, trim: true }
    ],

    // =====================================
    // 🚦 Account Status
    // =====================================

    // Current account status
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },

    // Last successful login timestamp
    lastLoginAt: { type: Date },

    // =====================================
    // 🔐 Session & Security Tracking
    // =====================================

    // Currently active device information
    currentDevice: deviceSchema,

    // Historical login records
    loginHistory: [loginHistorySchema],

    // Active and recent JWT/session tokens
    tokens: [
      {
        // JWT token string
        token: { type: String },

        // IP address where token was issued
        ipAddress: String,

        // User-Agent when token was issued
        userAgent: String,

        // Token creation timestamp
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // =====================================
    // 🧾 Audit & Ownership
    // =====================================

    // User who created this account
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true
  }
);

// =========================================
// 🔐 Password Hashing Middleware
// =========================================

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// =========================================
// 🔑 Authentication Helpers
// =========================================

// Compare entered password with hashed password
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// =========================================
// ❌ JSON Transform Helpers
// =========================================

// Remove password field when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
