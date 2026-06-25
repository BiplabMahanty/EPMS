const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authenticateAny = require('../middleware/authenticateAny');
const { uploadFor } = require('../middleware/upload');
const ctrl = require('../controllers/party.controller');

router.get('/', authenticateAny, ctrl.getParties);
router.get('/:id', authenticateAny, ctrl.getParty);
router.use(authenticate);
router.post('/', ...uploadFor('customers'), ctrl.createParty);
router.get('/:id', ctrl.getParty);
router.patch('/:id', ...uploadFor('customers'), ctrl.updateParty);
router.put('/:id', ...uploadFor('customers'), ctrl.updateParty);
router.delete('/:id', ctrl.deleteParty);
router.get('/:id/ledger', ctrl.getPartyLedger);

module.exports = router;
