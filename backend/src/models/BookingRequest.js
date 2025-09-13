const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  billboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billboard',
    required: true
  },
  advertiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 500
  },
  hasDispute: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  disputeStatus: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingRequestSchema.index({ advertiserId: 1 });
bookingRequestSchema.index({ billboardId: 1 });
bookingRequestSchema.index({ status: 1 });
bookingRequestSchema.index({ hasDispute: 1, disputeStatus: 1 });

// Validation to ensure end date is after start date
bookingRequestSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);