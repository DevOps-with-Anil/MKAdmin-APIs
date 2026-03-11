const mongoose = require("mongoose");
const { rootDB } = require("../../config/db");

const { Schema } = mongoose;

const tenantKYBSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },

    companyType: String,

    gstNumber: String,
    panNumber: String,

    registrationNumber: String,

    documents: {
      panCard: String,
      gstCertificate: String,
      incorporationCertificate: String,
      addressProof: String
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "SYS_User"
    },

    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    rejectionReason: String
  },
  {
    timestamps: true
  }
);

tenantKYBSchema.index({ tenantId: 1 });

module.exports =
  rootDB.models.TenantKYB ||
  rootDB.model("TenantKYB", tenantKYBSchema);