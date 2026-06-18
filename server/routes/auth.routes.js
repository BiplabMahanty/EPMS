const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');

const validateRegister = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('businessName').trim().notEmpty(),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', validateRegister, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', body('email').isEmail(), ctrl.forgotPassword);
router.post('/reset-password/:token', body('password').isLength({ min: 6 }), ctrl.resetPassword);

module.exports = router;
