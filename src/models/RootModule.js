const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true   // Global catalog
  },

  actions: [actionSchema],

  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },

  // Global Level
  level: {
    type: String,
    enum: ['ROOT'],
    required: true,
    index: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
