const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const ctrl = require('../controllers/unit.controller');

router.use(authenticate);
router.get('/', ctrl.getUnits);
router.post('/', ctrl.createUnit);
router.patch('/:id', ctrl.updateUnit);
router.delete('/:id', ctrl.deleteUnit);

module.exports = router;
