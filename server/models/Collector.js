const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collector name is required'],
      unique: true,
      trim: true,
      maxlength: [70, 'Collector name cannot exceed 70 characters'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Collector', collectorSchema);
