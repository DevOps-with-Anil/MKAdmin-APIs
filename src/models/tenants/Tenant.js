// const mongoose = require("mongoose");
// const { rootDB } = require("../../config/db");
// const { isValidEmail, isValidPhone } = require("../../utils/validator");

// const { Schema } = mongoose;

// /**
//  * =========================================
//  * 🌍 Multilingual Schema
//  * =========================================
//  */

// const localizedSchema = new Schema({}, { _id: false, strict: false });

// /**
//  * =========================================
//  * 🏢 Address Schema
//  * =========================================
//  */

// const addressSchema = new Schema(
//   {
//     addressLine1: { type: String, trim: true },
//     addressLine2: { type: String, trim: true },
//     landmark: { type: String, trim: true },
//     zipCode: { type: String, trim: true },
//     city: { type: String, trim: true },
//     state: { type: String, trim: true },
//     country: { type: String, trim: true },
//     latitude: String,
//     longitude: String,
//     isVerified: {
//       type: Boolean,
//       default: false
//     }
//   },
//   { _id: false }
// );

// /**
//  * =====================================
//  * 🔐 Tenant Action Schema
//  * =====================================
//  */

// const tenantActionSchema = new Schema(
//   {
//     actionKey: {
//       type: String,
//       required: true,
//       uppercase: true,
//       trim: true
//     },

//     actionName: localizedSchema,

//     allowed: {
//       type: Boolean,
//       default: false
//     }
//   },
//   { _id: false }
// );

// /**
//  * =====================================
//  * 🧩 Tenant Module Schema
//  * =====================================
//  */

// const tenantModuleSchema = new Schema(
//   {
//     moduleKey: {
//       type: String,
//       required: true,
//       uppercase: true,
//       trim: true
//     },

//     moduleName: localizedSchema,

//     actions: {
//       type: [tenantActionSchema],
//       default: []
//     }
//   },
//   { _id: false }
// );

// /**
//  * =========================================
//  * 🎯 Tenant Schema
//  * =========================================
//  */

// const tenantSchema = new Schema(
//   {
//     /**
//      * =====================================
//      * CONTACT INFO
//      * =====================================
//      */

//     contact_email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: isValidEmail,
//         message: "Invalid email"
//       }
//     },

//     phoneCode: {
//       type: String,
//       trim: true
//     },

//     contact_phoneNumber: {
//       type: String,
//       trim: true,
//       validate: {
//         validator: isValidPhone,
//         message: "Invalid phone"
//       }
//     },

//     logo: String,

//     /**
//      * =====================================
//      * BUSINESS INFO
//      * =====================================
//      */

//     companyName: localizedSchema,
//     description: localizedSchema,

//     website: {
//       type: String,
//       trim: true
//     },

//     /**
//      * =====================================
//      * DOMAIN ACCESS CONTROL
//      * =====================================
//      */

//     adminPanelUrl: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     apiDomains: {
//       type: [String],
//       default: []
//     },

//     /**
//      * =====================================
//      * ADDRESS
//      * =====================================
//      */

//     address: addressSchema,

//     /**
//      * =====================================
//      * KYB
//      * =====================================
//      */

//     kybVerificationId: {
//       type: Schema.Types.ObjectId,
//       ref: "KybVerification"
//     },

//     kybStatus: {
//       type: String,
//       enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"],
//       default: "PENDING"
//     },

//     /**
//      * =====================================
//      * SUBSCRIPTION
//      * =====================================
//      */

//     subscriptionPlanId: {
//       type: Schema.Types.ObjectId,
//       ref: "Subscription"
//     },

//     assignedModules: {
//       type: [tenantModuleSchema],
//       default: []
//     },

//     subscriptionStatus: {
//       type: String,
//       enum: ["ACTIVE", "INACTIVE", "EXPIRED", "CANCELLED", "PENDING"]
//     },

//     /**
//      * =====================================
//      * TENANT STATUS
//      * =====================================
//      */

//     status: {
//       type: String,
//       enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"],
//       default: "PENDING"
//     },

//     /**
//      * =====================================
//      * AUDIT
//      * =====================================
//      */

//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "SYS_User",
//       required: true
//     },

//     isDeleted: {
//       type: Boolean,
//       default: false
//     },

//     deletedAt: Date
//   },
//   {
//     timestamps: true
//   }
// );

// /**
//  * =========================================
//  * 📈 INDEXES
//  * =========================================
//  */

// tenantSchema.index(
//   { contact_email: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { isDeleted: false }
//   }
// );

// tenantSchema.index({ subscriptionPlanId: 1 });
// tenantSchema.index({ status: 1 });

// /**
//  * =========================================
//  * 🚀 EXPORT
//  * =========================================
//  */

// module.exports =
//   rootDB.models.Tenant ||
//   rootDB.model("Tenant", tenantSchema);


const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");
const { isValidEmail, isValidPhone } = require("../../utils/validator");

const { Schema } = mongoose;

const localizedSchema = new Schema({}, { _id: false, strict: false });

const addressSchema = new Schema(
  {
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    zipCode: String,
    city: String,
    state: String,
    country: String,
    latitude: String,
    longitude: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const tenantSchema = new Schema(
  {
    /**
     * CONTACT INFO
     */
    contact_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidEmail,
        message: "Invalid email"
      }
    },

    phoneCode: String,

    contact_phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: isValidPhone,
        message: "Invalid phone"
      }
    },

    logo: String,

    /**
     * BUSINESS INFO
     */

    companyName: localizedSchema,
    description: localizedSchema,

    website: String,

    /**
     * DOMAIN CONFIG
     */

    adminPanelUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    apiDomains: {
      type: [String],
      default: []
    },

    /**
     * ADDRESS
     */

    address: addressSchema,

    /**
     * KYB REFERENCE
     */

    kybId: {
      type: Schema.Types.ObjectId,
      ref: "TenantKYB"
    },

    kybStatus: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    /**
     * CURRENT SUBSCRIPTION
     */

    currentSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "TenantSubscription"
    },

    /**
     * STATUS
     */

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"],
      default: "PENDING"
    },

    /**
     * AUDIT
     */

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User",
      required: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: Date
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES
 */

tenantSchema.index(
  { contact_email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

tenantSchema.index({ status: 1 });

module.exports =
  rootDB.models.Tenant ||
  rootDB.model("Tenant", tenantSchema);