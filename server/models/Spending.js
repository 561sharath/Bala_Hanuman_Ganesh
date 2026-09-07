const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    amountSpent: {
      type: Number,
      required: [true, 'Amount spent is required'],
      min: [0, 'Amount spent cannot be negative'],
      max: [100000, 'Amount spent cannot exceed 100,000'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    spentBy: {
      type: String,
      required: [true, 'Spent by is required'],
      trim: true,
      maxlength: [70, 'Spent by cannot exceed 70 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB performance indexes
spendingSchema.index({ itemName: 1 });
spendingSchema.index({ date: -1 });
spendingSchema.index({ spentBy: 1 });

module.exports = mongoose.model('Spending', spendingSchema);
