const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

/**
 * MODULE ACTION
 */

const tenantActionSchema = new Schema(
  {
    actionKey: {
      type: String,
      required: true,
      uppercase: true
    },

    actionName: Schema.Types.Mixed,

    allowed: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

/**
 * MODULE
 */

const tenantModuleSchema = new Schema(
  {
    moduleKey: {
      type: String,
      required: true,
      uppercase: true
    },

    moduleName: Schema.Types.Mixed,

    actions: {
      type: [tenantActionSchema],
      default: []
    }
  },
  { _id: false }
);

/**
 * SUBSCRIPTION
 */

const tenantSubscriptionSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    planId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    expiryDate: {
      type: Date,
      required: true
    },

    /**
     * MODULE SNAPSHOT
     */

    modules: {
      type: [tenantModuleSchema],
      default: []
    },

    /**
     * BILLING
     */

    paymentProvider: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "MANUAL"]
    },

    paymentId: String,
    invoiceId: String,

    /**
     * STATUS
     */

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"],
      default: "PENDING"
    },

    cancelledAt: Date
  },
  {
    timestamps: true
  }
);

tenantSubscriptionSchema.index({ tenantId: 1 });
tenantSubscriptionSchema.index({ status: 1 });

module.exports =
  rootDB.models.TenantSubscription ||
  rootDB.model("TenantSubscription", tenantSubscriptionSchema);