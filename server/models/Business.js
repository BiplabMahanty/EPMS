const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { url: String, publicId: String },
  tagline: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  gstin: String,
  state: String,
  invoicePrefix: { type: String, default: 'ESP' },
  invoiceStartNumber: { type: Number, default: 1 },
  invoiceTerms: String,
  invoiceFooter: String,
  financialYearStart: { type: Number, default: 4 },
  currency: { type: String, default: '₹' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
