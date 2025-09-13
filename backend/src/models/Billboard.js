const mongoose = require('mongoose');

const billboardSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  size: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  imageUrl: {
    type: String
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
billboardSchema.index({ ownerId: 1 });
billboardSchema.index({ isAvailable: 1, isApproved: 1 });
billboardSchema.index({ location: 'text', name: 'text', description: 'text' });

module.exports = mongoose.model('Billboard', billboardSchema);