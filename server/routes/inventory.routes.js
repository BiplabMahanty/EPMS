const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkPermission = require('../middleware/checkPermission');
const ctrl = require('../controllers/inventory.controller');

router.use(authenticate);
router.get('/', ctrl.getInventory);
router.post('/adjust', checkPermission('canManageStock'), ctrl.adjustStock);
router.get('/ledger', ctrl.getLedger);

module.exports = router;
