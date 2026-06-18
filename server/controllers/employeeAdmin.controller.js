const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const generateEmployeeId = async (businessId) => {
  const count = await Employee.countDocuments({ businessId });
  return `EMP${String(count + 1).padStart(4, '0')}`;
};

exports.list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = { businessId: req.user.businessId };
  if (status) query.status = status;
  const result = await Employee.paginate(query, { page: +page, limit: +limit, select: '-passwordHash', sort: { createdAt: -1 } });
  res.json(result);
});

exports.get = asyncHandler(async (req, res) => {
  const emp = await Employee.findOne({ _id: req.params.id, businessId: req.user.businessId }).select('-passwordHash');
  if (!emp) throw new AppError('Employee not found', 404);
  res.json(emp);
});

exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, phone, designation, department, joiningDate, salary } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);

  const exists = await Employee.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError('Email already registered', 409);

  const employeeId = req.body.employeeId || await generateEmployeeId(req.user.businessId);
  const idExists = await Employee.findOne({ employeeId, businessId: req.user.businessId });
  if (idExists) throw new AppError('Employee ID already exists', 409);

  const data = { name, email, employeeId, passwordHash: await bcrypt.hash(password, 12), phone, designation, department, joiningDate, salary, businessId: req.user.businessId, createdBy: req.user._id };
  if (req.file?.imageUrl) data.photo = req.file.imageUrl;

  const emp = await Employee.create(data);
  const { passwordHash, ...safe } = emp.toObject();
  res.status(201).json(safe);
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'designation', 'department', 'joiningDate', 'salary', 'status'];
  const update = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (req.file?.imageUrl) update.photo = req.file.imageUrl;

  const emp = await Employee.findOneAndUpdate({ _id: req.params.id, businessId: req.user.businessId }, update, { new: true }).select('-passwordHash');
  if (!emp) throw new AppError('Employee not found', 404);
  res.json(emp);
});

exports.remove = asyncHandler(async (req, res) => {
  const emp = await Employee.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  if (!emp) throw new AppError('Employee not found', 404);
  res.json({ success: true, message: 'Employee deleted' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) throw new AppError('New password required', 400);
  const emp = await Employee.findOne({ _id: req.params.id, businessId: req.user.businessId });
  if (!emp) throw new AppError('Employee not found', 404);
  emp.passwordHash = await bcrypt.hash(newPassword, 12);
  await emp.save();
  res.json({ message: 'Password reset' });
});

// Attendance
exports.checkIn = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await Attendance.findOne({ employeeId: req.employee._id, date: today });
  if (existing?.checkIn) throw new AppError('Already checked in today', 400);
  const att = await Attendance.findOneAndUpdate(
    { employeeId: req.employee._id, businessId: req.employee.businessId, date: today },
    { checkIn: new Date() }, { upsert: true, new: true }
  );
  res.json(att);
});

exports.checkOut = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const att = await Attendance.findOneAndUpdate(
    { employeeId: req.employee._id, businessId: req.employee.businessId, date: today },
    { checkOut: new Date() }, { new: true }
  );
  if (!att) throw new AppError('No check-in found for today', 400);
  res.json(att);
});

exports.attendanceHistory = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const query = { employeeId: req.employee._id };
  if (from || to) { query.date = {}; if (from) query.date.$gte = from; if (to) query.date.$lte = to; }
  const history = await Attendance.find(query).sort({ date: -1 }).lean();
  res.json(history);
});
