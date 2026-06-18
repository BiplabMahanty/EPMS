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
  photo: String,
  // Customer extras
  totalOrders: { type: Number, default: 0 },
  totalSpending: { type: Number, default: 0 },
  lastPurchaseDate: Date,
  // Supplier extras
  dueAmount: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

partySchema.index({ phone: 1, businessId: 1 });
partySchema.index({ email: 1, businessId: 1 }, { sparse: true });
partySchema.index({ type: 1, businessId: 1 });
partySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Party', partySchema);
