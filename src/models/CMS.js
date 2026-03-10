const mongoose = require('mongoose');
const { rootDB } = require('../config/db');

const { Schema } = mongoose;

const localizedTextSchema = new Schema(
  {
    en: { type: String, trim: true, required: true },
    fr: { type: String, trim: true, default: '' },
    ar: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const cmsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['PAGE', 'ARTICLE', 'POST', 'BANNER', 'OTHER'],
      default: 'PAGE',
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: localizedTextSchema,
      required: true
    },
    content: {
      type: localizedTextSchema,
      required: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      uppercase: true,
      trim: true,
      index: true
    },
    ownerAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {}
    },
    publishedAt: {
      type: Date,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

cmsSchema.index({ ownerAdmin: 1, slug: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
cmsSchema.index({ ownerAdmin: 1, createdAt: -1 });
cmsSchema.index({ 'title.en': 'text', 'content.en': 'text', slug: 'text', tags: 'text' });

module.exports =
  rootDB.models.CMS ||
  rootDB.model('CMS', cmsSchema);
