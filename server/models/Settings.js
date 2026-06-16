const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
  gstRegistration: { type: String, enum: ['registered', 'unregistered', 'composition'], default: 'registered' },
  gstin: String,
  businessState: String,
  defaultGstRate: { type: Number, default: 18 },
  taxInclusive: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
