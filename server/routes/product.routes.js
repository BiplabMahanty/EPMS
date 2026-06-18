const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkPermission = require('../middleware/checkPermission');
const { uploadMultipleFor } = require('../middleware/upload');
const ctrl = require('../controllers/product.controller');

router.use(authenticate);
router.get('/', ctrl.getProducts);
router.post('/', checkPermission('canAddProduct'), ...uploadMultipleFor('products', 'images', 5), ctrl.createProduct);
router.get('/:id', ctrl.getProduct);
router.patch('/:id', checkPermission('canEditProduct'), ...uploadMultipleFor('products', 'images', 5), ctrl.updateProduct);
router.put('/:id', checkPermission('canEditProduct'), ...uploadMultipleFor('products', 'images', 5), ctrl.updateProduct);
router.patch('/:id/main-image/:imageIndex', checkPermission('canEditProduct'), ctrl.setMainImage);
router.delete('/:id', checkPermission('canDeleteProduct'), ctrl.deleteProduct);

module.exports = router;
