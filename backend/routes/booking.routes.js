const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, updateBookingStatus } = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('Client'), createBooking);
router.get('/me', protect, authorize('Client', 'TalentProvider'), getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, authorize('TalentProvider', 'Client', 'Admin'), updateBookingStatus);

module.exports = router;
