const Business = require('../models/Business');
const Settings = require('../models/Settings');
const Product = require('../models/Product');
const Party = require('../models/Party');
const Invoice = require('../models/Invoice');

exports.getBusiness = async (req, res) => {
  const biz = await Business.findById(req.user.businessId);
  res.json(biz);
};

exports.updateBusiness = async (req, res) => {
  const biz = await Business.findByIdAndUpdate(req.user.businessId, req.body, { new: true });
  res.json(biz);
};

exports.getTaxSettings = async (req, res) => {
  const settings = await Settings.findOne({ businessId: req.user.businessId });
  res.json(settings || {});
};

exports.updateTaxSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { businessId: req.user.businessId },
    { ...req.body, businessId: req.user.businessId },
    { new: true, upsert: true }
  );
  res.json(settings);
};

exports.exportData = async (req, res) => {
  const bId = req.user.businessId;
  const [business, products, parties, invoices] = await Promise.all([
    Business.findById(bId),
    Product.find({ businessId: bId }),
    Party.find({ businessId: bId }),
    Invoice.find({ businessId: bId }),
  ]);
  res.setHeader('Content-Disposition', `attachment; filename="esp-backup-${Date.now()}.json"`);
  res.json({ exportedAt: new Date(), business, products, parties, invoices });
};
