const express = require('express');
const router = express.Router();
const {
  searchTalent,
  getTalentById,
  createOrUpdateProfile,
  updateAvailability,
  getMyProfile,
  addPortfolioItem,
} = require('../controllers/talent.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', searchTalent);
router.get('/me', protect, authorize('TalentProvider'), getMyProfile);
router.get('/:id', getTalentById);

// Updated: accepts profilePhoto and backgroundImage file uploads
router.post(
  '/',
  protect,
  authorize('TalentProvider'),
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
  ]),
  createOrUpdateProfile
);

router.patch('/:id/availability', protect, authorize('TalentProvider'), updateAvailability);
router.post('/portfolio', protect, authorize('TalentProvider'), addPortfolioItem);

module.exports = router;