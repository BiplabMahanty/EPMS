const mongoose = require('mongoose');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// ──────────────── CATEGORIES ────────────────

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ businessId: req.user.businessId }).sort({ name: 1 }).lean();
  res.json(categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) throw new AppError('Category name is required', 400);

  const exists = await Category.findOne({ businessId: req.user.businessId, name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) throw new AppError('Category already exists', 409);

  const data = { name, description: req.body.description?.trim(), colorLabel: req.body.colorLabel, icon: req.body.icon, businessId: req.user.businessId, createdBy: req.user._id };
  if (req.file?.imageUrl) data.image = req.file.imageUrl;

  const category = await Category.create(data);
  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) throw new AppError('Invalid category ID', 400);

  const update = {};
  if (req.body.name) {
    const name = req.body.name.trim();
    const exists = await Category.findOne({ _id: { $ne: id }, businessId: req.user.businessId, name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) throw new AppError('Category name already exists', 409);
    update.name = name;
  }
  if (req.body.description !== undefined) update.description = req.body.description.trim();
  if (req.body.colorLabel !== undefined) update.colorLabel = req.body.colorLabel;
  if (req.body.icon !== undefined) update.icon = req.body.icon;
  if (req.file?.imageUrl) update.image = req.file.imageUrl;

  const category = await Category.findOneAndUpdate({ _id: id, businessId: req.user.businessId }, update, { new: true, runValidators: true });
  if (!category) throw new AppError('Category not found', 404);
  res.json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) throw new AppError('Invalid category ID', 400);

  const hasSubs = await Subcategory.exists({ categoryId: id, businessId: req.user.businessId });
  if (hasSubs) throw new AppError('Delete subcategories first before deleting this category', 400);

  const category = await Category.findOneAndDelete({ _id: id, businessId: req.user.businessId });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, message: 'Category deleted' });
});

// ──────────────── SUBCATEGORIES ────────────────

exports.getSubcategories = asyncHandler(async (req, res) => {
  const query = { businessId: req.user.businessId };
  if (req.query.categoryId && validId(req.query.categoryId)) query.categoryId = req.query.categoryId;
  const subs = await Subcategory.find(query).populate('categoryId', 'name').sort({ name: 1 }).lean();
  res.json(subs);
});

exports.getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!validId(categoryId)) throw new AppError('Invalid category ID', 400);

  const category = await Category.findOne({ _id: categoryId, businessId: req.user.businessId });
  if (!category) throw new AppError('Category not found', 404);

  const subs = await Subcategory.find({ categoryId, businessId: req.user.businessId }).sort({ name: 1 }).lean();
  res.json(subs);
});

exports.createSubcategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;
  const name = req.body.name?.trim();

  if (!name || !categoryId) throw new AppError('Name and categoryId are required', 400);
  if (!validId(categoryId)) throw new AppError('Invalid category ID', 400);

  const category = await Category.findOne({ _id: categoryId, businessId: req.user.businessId });
  if (!category) throw new AppError('Category not found', 404);

  const exists = await Subcategory.findOne({ businessId: req.user.businessId, categoryId, name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) throw new AppError('Subcategory already exists in this category', 409);

  const data = { name, categoryId, description: req.body.description?.trim(), businessId: req.user.businessId, createdBy: req.user._id };
  if (req.file?.imageUrl) data.image = req.file.imageUrl;

  const sub = await Subcategory.create(data);
  await sub.populate('categoryId', 'name');
  res.status(201).json(sub);
});

exports.updateSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) throw new AppError('Invalid subcategory ID', 400);

  const update = {};
  if (req.body.name) update.name = req.body.name.trim();
  if (req.body.description !== undefined) update.description = req.body.description.trim();
  if (req.body.categoryId) {
    if (!validId(req.body.categoryId)) throw new AppError('Invalid category ID', 400);
    const cat = await Category.findOne({ _id: req.body.categoryId, businessId: req.user.businessId });
    if (!cat) throw new AppError('Category not found', 404);
    update.categoryId = req.body.categoryId;
  }
  if (req.file?.imageUrl) update.image = req.file.imageUrl;

  const sub = await Subcategory.findOneAndUpdate({ _id: id, businessId: req.user.businessId }, update, { new: true, runValidators: true }).populate('categoryId', 'name');
  if (!sub) throw new AppError('Subcategory not found', 404);
  res.json(sub);
});

exports.deleteSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) throw new AppError('Invalid subcategory ID', 400);

  const sub = await Subcategory.findOneAndDelete({ _id: id, businessId: req.user.businessId });
  if (!sub) throw new AppError('Subcategory not found', 404);
  res.json({ success: true, message: 'Subcategory deleted' });
});
