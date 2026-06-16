const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['customer', 'supplier', 'both'], required: true },
  phone: { type: String, required: true },
  email: String,
  gstin: String,
  billingAddress: String,
  shippingAddress: String,
  openingBalance: { type: Number, default: 0 },
  balanceType: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' },
  creditLimit: { type: Number, default: 0 },
  notes: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

partySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Party', partySchema);
