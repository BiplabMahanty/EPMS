const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/settings.controller');

router.use(authenticate);
router.get('/business', ctrl.getBusiness);
router.patch('/business', authorize('owner', 'admin'), ctrl.updateBusiness);
router.get('/tax', ctrl.getTaxSettings);
router.patch('/tax', authorize('owner', 'admin'), ctrl.updateTaxSettings);
router.get('/export', authorize('owner', 'admin'), ctrl.exportData);

module.exports = router;
