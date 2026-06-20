const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/tax.controller');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('owner', 'admin'), ctrl.create);
router.patch('/:id', authorize('owner', 'admin'), ctrl.update);
router.delete('/:id', authorize('owner', 'admin'), ctrl.remove);

module.exports = router;
