const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  colorLabel: String,
  icon: String,
  image: String,
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

categorySchema.index({ name: 1, businessId: 1 }, { unique: true });
categorySchema.index({ businessId: 1 });

module.exports = mongoose.model('Category', categorySchema);
