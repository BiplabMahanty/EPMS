const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rate: { type: Number, required: true, min: 0, max: 100 },
  type: { type: String, enum: ['gst', 'vat', 'custom'], default: 'gst' },
  isDefault: { type: Boolean, default: false },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
}, { timestamps: true });

taxSchema.index({ businessId: 1 });

module.exports = mongoose.model('Tax', taxSchema);
