const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');
const { updateStock } = require('../services/stock.service');
const mongoose = require('mongoose');

exports.getInventory = async (req, res) => {
  const { status } = req.query;
  const bId = req.user.businessId;
  let match = { businessId: new mongoose.Types.ObjectId(bId) };
  if (status === 'low') match.$expr = { $lte: ['$currentStock', '$lowStockThreshold'] };
  if (status === 'out') match.currentStock = 0;

  const products = await Product.find(match).populate('category', 'name').populate('unit', 'symbol');
  res.json(products);
};

exports.adjustStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId, quantity, type, reason } = req.body;
    const qty = type === 'manual_deduct' ? -Math.abs(quantity) : Math.abs(quantity);
    const balance = await updateStock(productId, qty, type, null, reason, req.user.businessId, req.user._id, session);
    await session.commitTransaction();
    res.json({ message: 'Stock adjusted', balanceAfter: balance });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.getLedger = async (req, res) => {
  const { productId, page = 1, limit = 50 } = req.query;
  const query = { businessId: req.user.businessId };
  if (productId) query.product = productId;
  const skip = (page - 1) * limit;
  const entries = await StockLedger.find(query).populate('product', 'name sku')
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json(entries);
};
