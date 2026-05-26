const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");
const { isValidEmail, isValidPhone } = require("../../utils/validator");

const { Schema } = mongoose;

/* ================= MULTILANG ================= */
const localizedSchema = new Schema({}, { _id: false, strict: false });

/* ================= CONTACT ================= */
const phoneSchema = new Schema(
  {
    code: { type: String, trim: true },
    number: {
      type: String,
      trim: true,
      validate: { validator: isValidPhone, message: "Invalid phone" }
    }
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: { validator: isValidEmail, message: "Invalid email" }
    },
    phone: phoneSchema
  },
  { _id: false }
);

/* ================= PLATFORM ================= */
const platformSchema = new Schema(
  {
    website: { type: String, trim: true },
    adminPanelUrl: { type: String, required: true, unique: true, trim: true }
  },
  { _id: false }
);

/* ================= ADDRESS ================= */
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
    isVerified: { type: Boolean, default: false }
  },
  { _id: false }
);

/* ================= MAIN SCHEMA ================= */
const tenantSchema = new Schema(
  {
    /* BUSINESS */
    companyName: localizedSchema,
    description: localizedSchema,

    /* CONTACT */
    contact: contactSchema,

    /* PLATFORM */
    platform: platformSchema,

    apiDomains: { type: [String], default: [] },

    /* ADDRESS */
    address: addressSchema,

    /* KYB */
    kybId: { type: Schema.Types.ObjectId, ref: "TenantKYB" },
    kybStatus: {
      type: String,
      enum: ["PENDING", "UPLOADED", "APPROVED", "REJECTED", "SUSPENDED", "UNDER_REVIEW"],
      default: "PENDING"
    },

    /* SUBSCRIPTION */
    currentSubscriptionId: { type: Schema.Types.ObjectId, ref: "TenantSubscription" },

    /* STATUS */
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], default: "ACTIVE" },

    /* LOGO */
    logo: { type: String, default: null },

    /* AUDIT */
    createdBy: { type: Schema.Types.ObjectId, ref: "SYS_User", required: true },

    /* UNIQUE IDS */
    tenantId: { type: String, unique: true, uppercase: true, length: 8 },

    /* DELETION */
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
tenantSchema.index({ "contact.email": 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
// tenantSchema.index({ "platform.adminPanelUrl": 1 }, { unique: true });
// tenantSchema.index({ status: 1 });

/* ================= PRE-SAVE HOOK TO GENERATE UNIQUE IDS ================= */
tenantSchema.pre("save", async function (next) {
  const generateId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  // Generate tenantId if not exists
  if (!this.tenantId) {
    let unique = false;
    while (!unique) {
      const newId = generateId();
      const exists = await this.constructor.findOne({ tenantId: newId });
      if (!exists) { this.tenantId = newId; unique = true; }
    }
  }

  next();
});

/* ================= EXPORT ================= */
module.exports = rootDB.models.Tenant || rootDB.model("Tenant", tenantSchema);