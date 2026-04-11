const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  verifyPayment,
  getPaymentByBooking,
  refundPayment,
} = require('../controllers/payment.controller');

// Client creates a Razorpay order for a confirmed booking
router.post('/create-order', protect, authorize('Client'), createOrder);

// Verify payment signature after Razorpay popup
router.post('/verify', protect, verifyPayment);

// Get payment details for a booking (client or talent)
router.get('/booking/:bookingId', protect, getPaymentByBooking);

// Admin/system triggers refund
router.post('/refund', protect, authorize('Admin'), refundPayment);

module.exports = router;