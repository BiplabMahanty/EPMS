const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
