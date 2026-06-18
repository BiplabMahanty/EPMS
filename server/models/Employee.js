const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  employeeId: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: String,
  photo: String,
  designation: String,
  department: String,
  joiningDate: Date,
  salary: { amount: Number, type: { type: String, enum: ['monthly', 'daily', 'hourly'], default: 'monthly' } },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastLogin: Date,
}, { timestamps: true });

employeeSchema.index({ employeeId: 1, businessId: 1 }, { unique: true });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ businessId: 1 });
employeeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Employee', employeeSchema);
