const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticateEmployee = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new AppError('Unauthorized', 401);
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type !== 'employee') throw new AppError('Unauthorized', 401);
  const emp = await Employee.findById(decoded.id).select('-passwordHash');
  if (!emp || emp.status === 'inactive') throw new AppError('Unauthorized', 401);
  req.employee = emp;
  next();
});

module.exports = authenticateEmployee;
