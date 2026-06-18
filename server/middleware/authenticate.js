const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'employee') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || user.status === 'inactive') return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
