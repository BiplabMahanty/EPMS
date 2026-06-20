const Tax = require('../models/Tax');

exports.list = async (req, res) => {
  const taxes = await Tax.find({ businessId: req.user.businessId }).sort({ rate: 1 });
  res.json(taxes);
};

exports.create = async (req, res) => {
  if (req.body.isDefault) {
    await Tax.updateMany({ businessId: req.user.businessId }, { isDefault: false });
  }
  const tax = await Tax.create({ ...req.body, businessId: req.user.businessId });
  res.status(201).json(tax);
};

exports.update = async (req, res) => {
  if (req.body.isDefault) {
    await Tax.updateMany({ businessId: req.user.businessId }, { isDefault: false });
  }
  const tax = await Tax.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId },
    req.body,
    { new: true }
  );
  if (!tax) return res.status(404).json({ message: 'Tax not found' });
  res.json(tax);
};

exports.remove = async (req, res) => {
  await Tax.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'Deleted' });
};
