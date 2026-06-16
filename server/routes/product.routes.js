const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkPermission = require('../middleware/checkPermission');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/product.controller');

router.use(authenticate);
router.get('/', ctrl.getProducts);
router.post('/', checkPermission('canAddProduct'), upload.array('images', 5), ctrl.createProduct);
router.get('/:id', ctrl.getProduct);
router.patch('/:id', checkPermission('canEditProduct'), upload.array('images', 5), ctrl.updateProduct);
router.delete('/:id', checkPermission('canDeleteProduct'), ctrl.deleteProduct);

module.exports = router;
