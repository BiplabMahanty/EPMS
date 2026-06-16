const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkPermission = require('../middleware/checkPermission');
const ctrl = require('../controllers/invoice.controller');

router.use(authenticate);
router.get('/', ctrl.getInvoices);
router.post('/', checkPermission('canCreateInvoice'), ctrl.createInvoice);
router.get('/:id/pdf', ctrl.getInvoicePDF);
router.get('/:id', ctrl.getInvoice);
router.patch('/:id', checkPermission('canCreateInvoice'), ctrl.updateInvoice);
router.post('/:id/payment', checkPermission('canCreateInvoice'), ctrl.recordPayment);

module.exports = router;
