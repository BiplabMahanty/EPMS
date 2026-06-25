const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employee.controller');
const adminCtrl = require('../controllers/employeeAdmin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const authenticateEmployee = require('../middleware/authenticateEmployee');
const { uploadFor } = require('../middleware/upload');

// Public
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

// Employee self-service (protected by employee token)
router.use(authenticateEmployee);
router.get('/dashboard', ctrl.getDashboard);
router.get('/orders', ctrl.getOrders);
router.get('/profile', ctrl.getProfile);
router.patch('/profile', ...uploadFor('employees'), ctrl.updateProfile);
router.post('/change-password', ctrl.changePassword);
router.get('/sales', ctrl.getSales);
router.post('/sales', ctrl.createSale);
router.get('/sales/:id', ctrl.getSale);

module.exports = router;
