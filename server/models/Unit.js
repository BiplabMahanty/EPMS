const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  symbol: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
}, { timestamps: true });

unitSchema.index({ name: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model('Unit', unitSchema);
