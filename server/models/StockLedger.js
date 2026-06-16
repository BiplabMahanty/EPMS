const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'manual_add', 'manual_deduct', 'return_in', 'return_out'],
    required: true,
  },
  reference: String,
  reason: String,
  balanceAfter: { type: Number, required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
