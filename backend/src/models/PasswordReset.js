const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resetCode: {
    type: String,
    required: true
  },
  contactMethod: {
    type: String, // 'email' or 'phone'
    required: true
  },
  contactValue: {
    type: String, // actual email or phone number
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 15 * 60 * 1000 // 15 minutes from now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index to automatically delete expired tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
passwordResetSchema.index({ userId: 1, isUsed: 1 });
passwordResetSchema.index({ resetCode: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);

