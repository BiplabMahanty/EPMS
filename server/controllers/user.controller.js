const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../config/mailer');
const crypto = require('crypto');

exports.getUsers = async (req, res) => {
  const users = await User.find({ businessId: req.user.businessId }).select('-passwordHash -refreshToken');
  res.json(users);
};

exports.inviteUser = async (req, res) => {
  const { name, email, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const tempPassword = crypto.randomBytes(8).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const user = await User.create({ name, email, passwordHash, role: role || 'employee', businessId: req.user.businessId });

  await sendMail(email, 'You are invited to ESP',
    `<p>Hello ${name}, you have been invited. Your temporary password is: <b>${tempPassword}</b>. Please login and change it.</p>`
  );
  res.status(201).json({ message: 'Invitation sent', userId: user._id });
};

exports.updatePermissions = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId },
    { permissions: req.body.permissions },
    { new: true }
  ).select('-passwordHash -refreshToken');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.updateStatus = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId },
    { status: req.body.status },
    { new: true }
  ).select('-passwordHash -refreshToken');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'User deleted' });
};
