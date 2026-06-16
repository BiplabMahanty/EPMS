const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const lineItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  hsn: String,
  qty: { type: Number, required: true },
  unit: String,
  rate: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['flat', 'percent'], default: 'flat' },
  gstRate: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  amount: { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  type: { type: String, enum: ['sale', 'purchase'], required: true },
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  date: { type: Date, required: true },
  dueDate: Date,
  placeOfSupply: String,
  lineItems: [lineItemSchema],
  subtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'credit', 'cheque'] },
  paymentRef: String,
  status: { type: String, enum: ['draft', 'unpaid', 'partial', 'paid', 'cancelled'], default: 'draft' },
  notes: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

invoiceSchema.index({ invoiceNumber: 1, businessId: 1 }, { unique: true });
invoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Invoice', invoiceSchema);
