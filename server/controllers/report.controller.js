const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const mongoose = require('mongoose');

const dateRange = (startDate, endDate) => ({
  $gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 3, 1),
  $lte: endDate ? new Date(endDate) : new Date(),
});

exports.salesReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const bId = new mongoose.Types.ObjectId(req.user.businessId);
  const match = { businessId: bId, type: 'sale', date: dateRange(startDate, endDate) };

  const [summary] = await Invoice.aggregate([
    { $match: match },
    { $group: { _id: null, totalSales: { $sum: '$grandTotal' }, totalTax: { $sum: { $add: ['$cgst', '$sgst', '$igst'] } }, totalReceived: { $sum: '$amountPaid' }, outstanding: { $sum: '$balanceDue' }, count: { $sum: 1 } } },
  ]);

  const daily = await Invoice.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$grandTotal' } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({ summary: summary || {}, daily });
};

exports.purchaseReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const bId = new mongoose.Types.ObjectId(req.user.businessId);
  const match = { businessId: bId, type: 'purchase', date: dateRange(startDate, endDate) };

  const [summary] = await Invoice.aggregate([
    { $match: match },
    { $group: { _id: null, totalPurchases: { $sum: '$grandTotal' }, totalTax: { $sum: { $add: ['$cgst', '$sgst', '$igst'] } }, totalPaid: { $sum: '$amountPaid' }, outstanding: { $sum: '$balanceDue' }, count: { $sum: 1 } } },
  ]);

  res.json({ summary: summary || {} });
};

exports.stockReport = async (req, res) => {
  const bId = new mongoose.Types.ObjectId(req.user.businessId);
  const products = await Product.aggregate([
    { $match: { businessId: bId } },
    { $project: { name: 1, sku: 1, currentStock: 1, purchasePrice: 1, salePrice: 1, lowStockThreshold: 1, purchaseValue: { $multiply: ['$currentStock', '$purchasePrice'] }, saleValue: { $multiply: ['$currentStock', '$salePrice'] } } },
  ]);
  res.json(products);
};

exports.pnlReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const bId = new mongoose.Types.ObjectId(req.user.businessId);
  const range = dateRange(startDate, endDate);

  const [sales] = await Invoice.aggregate([
    { $match: { businessId: bId, type: 'sale', date: range } },
    { $group: { _id: null, revenue: { $sum: '$grandTotal' } } },
  ]);

  const [purchases] = await Invoice.aggregate([
    { $match: { businessId: bId, type: 'purchase', date: range } },
    { $group: { _id: null, cogs: { $sum: '$grandTotal' } } },
  ]);

  const revenue = sales?.revenue || 0;
  const cogs = purchases?.cogs || 0;
  res.json({ revenue, cogs, grossProfit: revenue - cogs });
};
