const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authenticateAny = require('../middleware/authenticateAny');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/tax.controller');

router.get('/', authenticateAny, ctrl.list);
router.use(authenticate);
router.post('/', authorize('owner', 'admin'), ctrl.create);
router.patch('/:id', authorize('owner', 'admin'), ctrl.update);
router.delete('/:id', authorize('owner', 'admin'), ctrl.remove);

module.exports = router;
