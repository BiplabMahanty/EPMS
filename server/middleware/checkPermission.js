const checkPermission = (permission) => (req, res, next) => {
  const { role, permissions } = req.user;
  if (role === 'owner' || role === 'admin') return next();
  if (permissions?.[permission]) return next();
  return res.status(403).json({ message: `Forbidden: missing permission ${permission}` });
};

module.exports = checkPermission;
