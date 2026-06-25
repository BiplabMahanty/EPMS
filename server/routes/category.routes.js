const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authenticateAny = require('../middleware/authenticateAny');
const checkPermission = require('../middleware/checkPermission');
const { uploadFor } = require('../middleware/upload');
const ctrl = require('../controllers/category.controller');

router.get('/categories', authenticateAny, ctrl.getCategories);
router.post('/categories', authenticate, checkPermission('canAddCategory'), ...uploadFor('categories'), ctrl.createCategory);
router.put('/categories/:id', authenticate, checkPermission('canAddCategory'), ...uploadFor('categories'), ctrl.updateCategory);
router.patch('/categories/:id', authenticate, checkPermission('canAddCategory'), ...uploadFor('categories'), ctrl.updateCategory);
router.delete('/categories/:id', authenticate, checkPermission('canAddCategory'), ctrl.deleteCategory);

router.get('/subcategories', authenticateAny, ctrl.getSubcategories);
router.get('/subcategories/category/:categoryId', authenticateAny, ctrl.getSubcategoriesByCategory);
router.post('/subcategories', authenticate, checkPermission('canAddCategory'), ...uploadFor('subcategories'), ctrl.createSubcategory);
router.put('/subcategories/:id', authenticate, checkPermission('canAddCategory'), ...uploadFor('subcategories'), ctrl.updateSubcategory);
router.patch('/subcategories/:id', authenticate, checkPermission('canAddCategory'), ...uploadFor('subcategories'), ctrl.updateSubcategory);
router.delete('/subcategories/:id', authenticate, checkPermission('canAddCategory'), ctrl.deleteSubcategory);

module.exports = router;
