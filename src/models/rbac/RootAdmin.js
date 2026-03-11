const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { rootDB } = require("../../config/db");

const {
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidPassword
} = require("../../utils/validator");

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
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// =========================================
// 🕘 Login History
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
    loggedInAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// =========================================
// 👤 User Schema
// =========================================
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: isValidName, message: "Invalid name" }
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: { validator: isValidEmail, message: "Invalid email" }
    },

    // ✅ USER TYPE
    userType: {
      type: String,
      enum: ["ROOT", "TENANT"],
      default: "ROOT",
      required: true,
      index: true
    },

    phoneCode: { type: String, trim: true },

    phoneNumber: {
      type: String,
      trim: true,
      validate: { validator: isValidPhone, message: "Invalid phone" }
    },

    photo: String,

    password: {
      type: String,
      required: true,
      select: true
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "SYS_Role",
      required: true
    },

    allowedCountries: [{ type: String, uppercase: true, trim: true }],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },

    lastLoginAt: Date,

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

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User"
    }
  },
  { timestamps: true }
);

// =========================================
// PASSWORD HASH
// =========================================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// =========================================
// HELPERS
// =========================================
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// =========================================
// EXPORT MODEL (SAFE)
// =========================================
module.exports =
  rootDB.models.SYS_User ||
  rootDB.model("SYS_User", userSchema);
