const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Invoice = require('../models/Invoice');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signAccessToken = (id) => ({
  accessToken: jwt.sign({ id, type: 'employee' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }),
});

exports.login = asyncHandler(async (req, res) => {
  const { email, employeeId, password } = req.body;
  if (!employeeId || !password) throw new AppError('EmployeeId and password are required', 400);
  console.log('Login body received:', { employeeId, password: password ? '[provided]' : '[missing]' });
  const emp = await Employee.findOne({ employeeId });
  console.log('Employee found:', emp ? emp.employeeId : 'NOT FOUND');
  if (!emp) throw new AppError('Invalid credentials', 401);
  if (emp.status === 'inactive') throw new AppError('Account inactive', 403);

  const match = await bcrypt.compare(password, emp.passwordHash);
  if (!match) throw new AppError('Invalid credentials', 401);

  const { accessToken } = signAccessToken(emp._id);
  emp.lastLogin = new Date();
  await emp.save();

  res.json({ accessToken, employee: { id: emp._id, name: emp.name, email: emp.email, employeeId: emp.employeeId, photo: emp.photo, designation: emp.designation, businessId: emp.businessId } });
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out' });
});

// Dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todaySales, todayOrders, monthlySales, monthlyOrders] = await Promise.all([
    Invoice.aggregate([{ $match: { businessId: req.employee.businessId, createdBy: req.employee._id, createdAt: { $gte: today }, type: 'sale' } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Invoice.countDocuments({ businessId: req.employee.businessId, createdBy: req.employee._id, createdAt: { $gte: today }, type: 'sale' }),
    Invoice.aggregate([{ $match: { businessId: req.employee.businessId, createdBy: req.employee._id, createdAt: { $gte: monthStart }, type: 'sale' } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Invoice.countDocuments({ businessId: req.employee.businessId, createdBy: req.employee._id, createdAt: { $gte: monthStart }, type: 'sale' }),
  ]);

  res.json({
    todaySales: todaySales[0]?.total || 0,
    todayOrders,
    monthlySales: monthlySales[0]?.total || 0,
    monthlyOrders,
  });
});

// Own orders
exports.getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, from, to, search } = req.query;
  const query = { businessId: req.employee.businessId, createdBy: req.employee._id, type: 'sale' };
  if (from || to) { query.createdAt = {}; if (from) query.createdAt.$gte = new Date(from); if (to) query.createdAt.$lte = new Date(to); }
  if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
  const result = await Invoice.paginate(query, { page: +page, limit: +limit, populate: { path: 'party', select: 'name phone' }, sort: { createdAt: -1 } });
  res.json(result);
});

// Profile
exports.getProfile = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.employee._id).select('-passwordHash');
  res.json(emp);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['phone'];
  const update = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (req.file?.imageUrl) update.photo = req.file.imageUrl;
  const emp = await Employee.findByIdAndUpdate(req.employee._id, update, { new: true }).select('-passwordHash');
  res.json(emp);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError('Both passwords required', 400);
  const emp = await Employee.findById(req.employee._id);
  const match = await bcrypt.compare(currentPassword, emp.passwordHash);
  if (!match) throw new AppError('Current password incorrect', 400);
  emp.passwordHash = await bcrypt.hash(newPassword, 12);
  await emp.save();
  res.json({ message: 'Password updated' });
});
