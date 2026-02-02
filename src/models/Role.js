const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    moduleName: {
      type: String,
      required: true,
      trim: true
    },
    actions: [
      {
        type: String,
        required: true,
        trim: true
      }
    ]
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

      description: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    permissions: {
      type: [permissionSchema],
      default: []
    },

    
    status: {
      type: String,
      enum: ['ACTIVE', 'DISABLED'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
