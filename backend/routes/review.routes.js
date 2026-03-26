// review.routes.js
const express = require('express');
const router = express.Router();
const { createReview, getTalentReviews } = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
router.post('/', protect, authorize('Client'), createReview);
router.get('/talent/:talentId', getTalentReviews);
module.exports = router;
