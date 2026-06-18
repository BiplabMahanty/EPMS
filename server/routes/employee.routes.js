const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employee.controller');
const authenticateEmployee = require('../middleware/authenticateEmployee');
const { uploadFor } = require('../middleware/upload');

// Public
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

// Protected
router.use(authenticateEmployee);
router.get('/dashboard', ctrl.getDashboard);
router.get('/orders', ctrl.getOrders);
router.get('/profile', ctrl.getProfile);
router.patch('/profile', ...uploadFor('employees'), ctrl.updateProfile);
router.post('/change-password', ctrl.changePassword);

module.exports = router;
