const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  toggleUserStatus,
  getPendingTalents,   
  verifyTalent,        
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All admin routes are protected — only Admin role can access
router.use(protect, authorize('Admin'));

router.get('/analytics',              getAnalytics);
router.get('/users',                  getUsers);
router.patch('/users/:id/toggle',     toggleUserStatus);

// Talent verification routes
router.get('/talents/pending',        getPendingTalents);
router.patch('/talents/:id/verify',   verifyTalent);

module.exports = router;