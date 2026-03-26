const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, toggleUserStatus } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('Admin'));
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);

module.exports = router;
