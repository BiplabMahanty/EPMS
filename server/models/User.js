const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema({
  canAddProduct: { type: Boolean, default: false },
  canEditProduct: { type: Boolean, default: false },
  canDeleteProduct: { type: Boolean, default: false },
  canAddCategory: { type: Boolean, default: false },
  canCreateInvoice: { type: Boolean, default: false },
  canViewSalesReport: { type: Boolean, default: false },
  canViewPurchaseReport: { type: Boolean, default: false },
  canAddPurchase: { type: Boolean, default: false },
  canManageStock: { type: Boolean, default: false },
  canViewDashboard: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'employee'], default: 'employee' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  permissions: { type: permissionsSchema, default: () => ({}) },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: Date,
  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
