const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { uploadFor } = require('../middleware/upload');
const ctrl = require('../controllers/party.controller');

router.use(authenticate);
router.get('/', ctrl.getParties);
router.post('/', ...uploadFor('customers'), ctrl.createParty);
router.get('/:id', ctrl.getParty);
router.patch('/:id', ...uploadFor('customers'), ctrl.updateParty);
router.put('/:id', ...uploadFor('customers'), ctrl.updateParty);
router.delete('/:id', ctrl.deleteParty);
router.get('/:id/ledger', ctrl.getPartyLedger);

module.exports = router;
