const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');


const { getDashboardCounts } = require('../controllers/dashboard.controller');


router.use(authenticate);
router.get('/counts', authorize('owner', 'admin'), getDashboardCounts);

module.exports = router;