const Party = require('../models/Party');
const Invoice = require('../models/Invoice');

exports.getParties = async (req, res) => {
  const { page = 1, limit = 20, search, type } = req.query;
  const query = { businessId: req.user.businessId };
  if (search) query.name = { $regex: search, $options: 'i' };
  if (type) query.type = type;
  const result = await Party.paginate(query, { page, limit, sort: { name: 1 } });
  res.json(result);
};

exports.createParty = async (req, res) => {
  const party = await Party.create({ ...req.body, businessId: req.user.businessId, createdBy: req.user._id });
  res.status(201).json(party);
};

exports.getParty = async (req, res) => {
  const party = await Party.findOne({ _id: req.params.id, businessId: req.user.businessId });
  if (!party) return res.status(404).json({ message: 'Party not found' });
  res.json(party);
};

exports.updateParty = async (req, res) => {
  const party = await Party.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, req.body, { new: true }
  );
  if (!party) return res.status(404).json({ message: 'Party not found' });
  res.json(party);
};

exports.deleteParty = async (req, res) => {
  await Party.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'Deleted' });
};

exports.getPartyLedger = async (req, res) => {
  const invoices = await Invoice.find({ party: req.params.id, businessId: req.user.businessId })
    .select('invoiceNumber type date grandTotal amountPaid balanceDue status')
    .sort({ date: -1 });
  res.json(invoices);
};
