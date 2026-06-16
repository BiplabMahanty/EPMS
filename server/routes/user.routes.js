const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/user.controller');

router.use(authenticate);
router.get('/', authorize('owner', 'admin'), ctrl.getUsers);
router.post('/invite', authorize('owner', 'admin'), ctrl.inviteUser);
router.patch('/:id/permissions', authorize('owner', 'admin'), ctrl.updatePermissions);
router.patch('/:id/status', authorize('owner', 'admin'), ctrl.updateStatus);
router.delete('/:id', authorize('owner'), ctrl.deleteUser);

module.exports = router;
