const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [70, 'Name cannot exceed 70 characters'],
    },
    nameLanguage: {
      type: String,
      enum: ['EN', 'TE'],
      default: 'EN',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
      max: [100000, 'Amount cannot exceed 100,000'],
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount Paid is required'],
      min: [0, 'Amount Paid cannot be negative'],
      max: [100000, 'Amount Paid cannot exceed 100,000'],
    },
    pendingAmount: {
      type: Number,
      required: true,
      min: [0, 'Pending Amount cannot be negative'],
    },
    paymentVia: {
      type: String,
      enum: ['UPI', 'Cash', null],
      default: null,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Paid', 'Pending', 'Balance'],
    },
    paidTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector',
      required: [true, 'Paid To collector is required'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to enforce Pending status rule
collectionSchema.pre('save', function (next) {
  if (this.status === 'Pending') {
    this.paymentVia = null;
  }
  next();
});

// Pre-update middleware to enforce Pending status rule
collectionSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update) {
    if (update.status === 'Pending' || update.$set?.status === 'Pending') {
      if (update.$set) {
        update.$set.paymentVia = null;
      } else {
        update.paymentVia = null;
      }
    }
  }
  next();
});

// MongoDB performance indexes
collectionSchema.index({ name: 1 });
collectionSchema.index({ date: -1 });
collectionSchema.index({ paidTo: 1 });
collectionSchema.index({ amountPaid: -1 });

module.exports = mongoose.model('Collection', collectionSchema);
