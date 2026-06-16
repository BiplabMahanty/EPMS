const Product = require('../models/Product');
const generateSKU = require('../utils/generateSKU');
const cloudinary = require('../config/cloudinary');

exports.getProducts = async (req, res) => {
  const { page = 1, limit = 20, search, category, subcategory, status, lowStock } = req.query;
  const query = { businessId: req.user.businessId };
  if (search) query.name = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (status) query.status = status;
  if (lowStock === 'true') query.$expr = { $lte: ['$currentStock', '$lowStockThreshold'] };

  const result = await Product.paginate(query, {
    page, limit, populate: ['category', 'subcategory', 'unit'], sort: { createdAt: -1 },
  });
  res.json(result);
};

exports.createProduct = async (req, res) => {
  const data = { ...req.body, businessId: req.user.businessId, createdBy: req.user._id };
  if (!data.sku) data.sku = generateSKU();
  if (req.files?.length) data.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  const product = await Product.create(data);
  res.status(201).json(product);
};

exports.getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId })
    .populate('category subcategory unit');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

exports.updateProduct = async (req, res) => {
  const update = { ...req.body };
  if (req.files?.length) update.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, update, { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  for (const img of product.images) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  res.json({ message: 'Deleted' });
};
