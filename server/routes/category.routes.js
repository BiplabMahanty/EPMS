const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkPermission = require('../middleware/checkPermission');
const ctrl = require('../controllers/category.controller');

router.use(authenticate);
router.get('/categories', ctrl.getCategories);
router.post('/categories', checkPermission('canAddCategory'), ctrl.createCategory);
router.patch('/categories/:id', checkPermission('canAddCategory'), ctrl.updateCategory);
router.delete('/categories/:id', checkPermission('canAddCategory'), ctrl.deleteCategory);

router.get('/subcategories', ctrl.getSubcategories);
router.post('/subcategories', checkPermission('canAddCategory'), ctrl.createSubcategory);
router.patch('/subcategories/:id', checkPermission('canAddCategory'), ctrl.updateSubcategory);
router.delete('/subcategories/:id', checkPermission('canAddCategory'), ctrl.deleteSubcategory);

module.exports = router;
