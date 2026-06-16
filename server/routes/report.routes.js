const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const checkPermission = require('../middleware/checkPermission');
const ctrl = require('../controllers/report.controller');

router.use(authenticate);
router.get('/sales', checkPermission('canViewSalesReport'), ctrl.salesReport);
router.get('/purchases', checkPermission('canViewPurchaseReport'), ctrl.purchaseReport);
router.get('/stock', authorize('owner', 'admin'), ctrl.stockReport);
router.get('/pnl', authorize('owner', 'admin'), ctrl.pnlReport);

module.exports = router;
