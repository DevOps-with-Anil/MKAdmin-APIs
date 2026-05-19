const mongoose = require("mongoose");
const { affiliateDB } = require("../../../config/db");


const { Schema } = mongoose;

/**
 * =========================================
 * 🌍 Multilingual Schema
 * =========================================
 */

const localizedSchema = new Schema(
  {},
  { _id: false, strict: false }
);

/**
 * =========================================
 * 🔐 Action Permission Schema
 * =========================================
 */

const actionPermissionSchema = new Schema(
  {
    actionKey: {
      type: String,
      required: true,
      uppercase: true
    },

    actionName: {
      type: localizedSchema,
      required: true
    },

    allowed: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

/**
 * =========================================
 * 🧩 Module Permission Schema
 * =========================================
 */

const modulePermissionSchema = new Schema(
  {
    moduleKey: {
      type: String,
      required: true,
      uppercase: true
    },

    moduleName: {
      type: localizedSchema,
      required: true
    },

    allowed: {
      type: Boolean,
      default: false
    },

    actions: {
      type: [actionPermissionSchema],
      default: []
    }
  },
  { _id: false }
);

/**
 * =========================================
 * 🎭 Role Schema
 * =========================================
 */

const roleSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },

    name: {
      type: localizedSchema,
      required: true
    },

    description: {
      type: localizedSchema
    },

    permissions: {
      type: [modulePermissionSchema],
      default: []
    },

    /**
     * =====================================
     * 👤 Role Creator Type
     * =====================================
     */

    createdByType: {
      type: String,
      enum: ["ROOT", "TENANT"],
      required: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      required: true
    },

    isSystem: {
      type: Boolean,
      default: false
    },

       // Active/inactive
     status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
  },
  { timestamps: true }
);

/**
 * =========================================
 * ⚡ INDEXES
 * =========================================
 */

// Unique role per tenant
roleSchema.index(
  { tenantId: 1, "name.en": 1 },
  { unique: true }
);

module.exports =
  affiliateDB.models.Tenant_Role ||
  affiliateDB.model("Tenant_Role", roleSchema);