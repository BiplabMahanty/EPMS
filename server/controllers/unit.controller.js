const Unit = require('../models/Unit');

exports.getUnits = async (req, res) => {
  const units = await Unit.find({ businessId: req.user.businessId }).sort({ name: 1 });
  res.json(units);
};

exports.createUnit = async (req, res) => {
  const unit = await Unit.create({ ...req.body, businessId: req.user.businessId });
  res.status(201).json(unit);
};

exports.updateUnit = async (req, res) => {
  const unit = await Unit.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, req.body, { new: true }
  );
  if (!unit) return res.status(404).json({ message: 'Unit not found' });
  res.json(unit);
};

exports.deleteUnit = async (req, res) => {
  await Unit.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'Deleted' });
};
