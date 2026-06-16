const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ businessId: req.user.businessId }).sort({ name: 1 });
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const cat = await Category.create({ ...req.body, businessId: req.user.businessId, createdBy: req.user._id });
  res.status(201).json(cat);
};

exports.updateCategory = async (req, res) => {
  const cat = await Category.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, req.body, { new: true }
  );
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
};

exports.deleteCategory = async (req, res) => {
  await Category.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'Deleted' });
};

exports.getSubcategories = async (req, res) => {
  const query = { businessId: req.user.businessId };
  if (req.query.parentCategory) query.parentCategory = req.query.parentCategory;
  const subs = await Subcategory.find(query).populate('parentCategory', 'name');
  res.json(subs);
};

exports.createSubcategory = async (req, res) => {
  const sub = await Subcategory.create({ ...req.body, businessId: req.user.businessId });
  res.status(201).json(sub);
};

exports.updateSubcategory = async (req, res) => {
  const sub = await Subcategory.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, req.body, { new: true }
  );
  if (!sub) return res.status(404).json({ message: 'Subcategory not found' });
  res.json(sub);
};

exports.deleteSubcategory = async (req, res) => {
  await Subcategory.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
  res.json({ message: 'Deleted' });
};
