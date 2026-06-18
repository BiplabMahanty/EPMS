const Product = require('../models/Product');
const generateSKU = require('../utils/generateSKU');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

const generateBarcode = () => String(Date.now()).slice(-12).padStart(12, '0');

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, subcategory, status, lowStock, barcode, sku } = req.query;
  const query = { businessId: req.user.businessId };
  if (search) query.$text = { $search: search };
  if (barcode) query.barcode = barcode;
  if (sku) query.sku = { $regex: sku, $options: 'i' };
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (status) query.status = status;
  if (lowStock === 'true') query.$expr = { $lte: ['$currentStock', '$lowStockThreshold'] };

  const result = await Product.paginate(query, {
    page: +page, limit: +limit,
    populate: [{ path: 'category', select: 'name' }, { path: 'subcategory', select: 'name' }, { path: 'unit', select: 'name symbol' }],
    sort: { createdAt: -1 },
  });
  res.json(result);
});

exports.createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body, businessId: req.user.businessId, createdBy: req.user._id };
  if (!data.sku) data.sku = generateSKU();
  if (!data.barcode) data.barcode = generateBarcode();
  if (req.files?.length) {
    data.images = req.files.map((f, i) => ({ url: f.imageUrl, isMain: i === 0 }));
    data.thumbnail = req.files[0].imageUrl;
  }
  const product = await Product.create(data);
  res.status(201).json(product);
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId })
    .populate('category subcategory unit');
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.files?.length) {
    update.images = req.files.map((f, i) => ({ url: f.imageUrl, isMain: i === 0 }));
    update.thumbnail = req.files[0].imageUrl;
  }
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, update, { new: true, runValidators: true }
  ).populate('category subcategory unit');
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deleted' });
});

exports.setMainImage = asyncHandler(async (req, res) => {
  const { id, imageIndex } = req.params;
  const product = await Product.findOne({ _id: id, businessId: req.user.businessId });
  if (!product) throw new AppError('Product not found', 404);
  product.images = product.images.map((img, i) => ({ ...img.toObject(), isMain: i === +imageIndex }));
  if (product.images[+imageIndex]) product.thumbnail = product.images[+imageIndex].url;
  await product.save();
  res.json(product);
});
