const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const authenticateAny = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'employee') {
      const emp = await Employee.findById(decoded.id).select('-passwordHash');
      if (!emp || emp.status === 'inactive') return res.status(401).json({ message: 'Unauthorized' });
      req.employee = emp;
      req.user = emp; // controllers use req.user.businessId
      req.businessId = emp.businessId;
    } else {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user || user.status === 'inactive') return res.status(401).json({ message: 'Unauthorized' });
      req.user = user;
      req.businessId = user.businessId;
    }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateAny;
