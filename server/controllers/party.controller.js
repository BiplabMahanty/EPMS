const Party = require('../models/Party');
const Invoice = require('../models/Invoice');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getParties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, type } = req.query;
  const query = { businessId: req.user.businessId };
  if (search) query.name = { $regex: search, $options: 'i' };
  if (type) query.type = type;
  const result = await Party.paginate(query, { page: +page, limit: +limit, sort: { name: 1 } });
  res.json(result);
});

exports.createParty = asyncHandler(async (req, res) => {
  const data = { ...req.body, businessId: req.user.businessId, createdBy: req.user._id };
  if (req.file?.imageUrl) data.photo = req.file.imageUrl;
  const party = await Party.create(data);
  res.status(201).json(party);
});

exports.getParty = asyncHandler(async (req, res) => {
  const party = await Party.findOne({ _id: req.params.id, businessId: req.user.businessId });
  if (!party) throw new AppError('Party not found', 404);

  const [totalOrders, totalSpending, lastPurchase] = await Promise.all([
    Invoice.countDocuments({ party: party._id, businessId: req.user.businessId, type: 'sale' }),
    Invoice.aggregate([{ $match: { party: party._id, businessId: req.user.businessId, type: 'sale' } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Invoice.findOne({ party: party._id, businessId: req.user.businessId, type: 'sale' }).sort({ createdAt: -1 }).select('createdAt'),
  ]);

  res.json({ ...party.toObject(), totalOrders, totalSpending: totalSpending[0]?.total || 0, lastPurchaseDate: lastPurchase?.createdAt });
});

exports.updateParty = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.file?.imageUrl) update.photo = req.file.imageUrl;
  const party = await Party.findOneAndUpdate({ _id: req.params.id, businessId: req.user.businessId }, update, { new: true, runValidators: true });
  if (!party) throw new AppError('Party not found', 404);
  res.json(party);
});

exports.deleteParty = asyncHandler(async (req, res) => {
  await Party.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'Deleted' });
});

exports.getPartyLedger = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ party: req.params.id, businessId: req.user.businessId })
    .select('invoiceNumber type date grandTotal amountPaid balanceDue status')
    .sort({ date: -1 });
  res.json(invoices);
});
