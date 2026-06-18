const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, trim: true },
  image: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

subcategorySchema.index({ categoryId: 1, businessId: 1 });
subcategorySchema.index({ businessId: 1 });
subcategorySchema.index({ name: 1, categoryId: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
