const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Business = require('../models/Business');
const Unit = require('../models/Unit');
const { sendMail } = require('../config/mailer');

const DEFAULT_UNITS = [
  { name: 'Piece', symbol: 'pcs' }, { name: 'Kilogram', symbol: 'kg' },
  { name: 'Gram', symbol: 'g' }, { name: 'Litre', symbol: 'L' },
  { name: 'Millilitre', symbol: 'ml' }, { name: 'Meter', symbol: 'm' },
  { name: 'Box', symbol: 'box' }, { name: 'Dozen', symbol: 'dz' },
  { name: 'Pack', symbol: 'pk' }, { name: 'Pair', symbol: 'pr' },
];

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  const { name, email, password, businessName } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: 'owner' });

  const business = await Business.create({ name: businessName, owner: user._id });
  user.businessId = business._id;
  await user.save();

  await Unit.insertMany(DEFAULT_UNITS.map((u) => ({ ...u, businessId: business._id })));

  const accessToken = signAccessToken(user._id);
  res.status(201).json({ accessToken, user: { id: user._id, name, email, role: user.role, businessId: business._id } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  console.log('Login attempt for:', email);
if (!user || !user.passwordHash) {
  return res.status(401).json({
    message: 'Invalid credentials'
  });
}

// const isMatch = await bcrypt.compare(
//   password,
//   user.passwordHash
// );
// console.log('Password match:', isMatch);

// if (!isMatch) {
//   return res.status(401).json({
//     message: 'Invalid credentials'
//   });
//   }   
  if (user.status === 'inactive') return res.status(403).json({ message: 'Account inactive' });

  const accessToken = signAccessToken(user._id);
  user.lastLogin = new Date();
  await user.save();

  res.json({ accessToken, user: { id: user._id, name: user.name, email, role: user.role, businessId: user.businessId, permissions: user.permissions } });
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
  await user.save();

  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendMail(user.email, 'Reset your ESP password', `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 1 hour.</p>`);
  res.json({ message: 'If that email exists, a reset link was sent.' });
};

exports.resetPassword = async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.passwordHash = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
};
