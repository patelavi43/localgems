const express = require('express');
const router = express.Router();
const {
  searchTalent, getTalentById, createOrUpdateProfile,
  updateAvailability, getMyProfile, addPortfolioItem,
} = require('../controllers/talent.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', searchTalent);
router.get('/me', protect, authorize('TalentProvider'), getMyProfile);
router.get('/:id', getTalentById);
router.post('/', protect, authorize('TalentProvider'), createOrUpdateProfile);
router.patch('/:id/availability', protect, authorize('TalentProvider'), updateAvailability);
router.post('/portfolio', protect, authorize('TalentProvider'), addPortfolioItem);

module.exports = router;
