// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     // Basic Info
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true
//     },

//     phoneNumber: {
//       type: String,
//       trim: true
//     },

//     photo: {
//       type: String
//     },

//     // Auth
//     password: {
//       type: String,
//       required: true,
//       select: true // needed for login comparison
//     },

//     // RBAC
//     role: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'RootRole',     // 🔁 Updated to RootRole
//       required: true
//     },

//     // Scope / Access Control
//     allowedCountries: [
//       {
//         type: String,
//         uppercase: true,
//         trim: true
//       }
//     ],

//     // Root vs Tenant (Future proof)
//     level: {
//       type: String,
//       enum: ['ROOT', 'TENANT'],
//       default: 'ROOT',
//       index: true
//     },

//     tenantId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Tenant',
//       index: true,
//       default: null
//     },

//     // Status & Activity
//     status: {
//       type: String,
//       enum: ['ACTIVE', 'INACTIVE'],
//       default: 'ACTIVE'
//     },

//     lastLoginAt: {
//       type: Date
//     },

//     // Optional Session Tokens
//     tokens: [
//       {
//         token: { type: String },
//         createdAt: { type: Date, default: Date.now }
//       }
//     ],

//     // Audit
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }
//   },
//   { timestamps: true }
// );

// // 🔐 Hash password before save
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // 🔑 Compare password
// userSchema.methods.comparePassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// // ❌ Remove password from JSON responses
// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   return obj;
// };

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deviceSchema = new mongoose.Schema(
  {
    ipAddress: String,
    userAgent: String,

    deviceType: {
      type: String, // mobile, desktop, tablet
      trim: true
    },

    os: {
      type: String, // iOS, Android, Windows, MacOS, Linux
      trim: true
    },

    browser: {
      type: String, // Chrome, Safari, Firefox, Edge
      trim: true
    },

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
    loggedInAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    phoneNumber: { type: String, trim: true },

    photo: { type: String },

    // Auth
    password: {
      type: String,
      required: true,
      select: true
    },

    // RBAC (ROOT ONLY)
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },

    // Scope / Geo
    allowedCountries: [
      { type: String, uppercase: true, trim: true }
    ],

    // Status
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },

    lastLoginAt: { type: Date },

    // 🔐 Session & Security Tracking
    currentDevice: deviceSchema,

    loginHistory: [loginHistorySchema],

    tokens: [
      {
        token: { type: String },
        ipAddress: String,
        userAgent: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare password
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ❌ Remove password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
