const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '10');

// ─── CREATE ORDER ──────────────────────────────────────────────────────────────
// POST /api/payments/create-order
// Called when client clicks "Pay Now" on a confirmed booking
const createOrder = async (req, res) => {
  try {
    const { booking_id } = req.body;

    const booking = await Booking.findById(booking_id).populate('talent_id');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only the client who owns this booking can pay
    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your booking' });
    }

    if (booking.status !== 'Confirmed' && booking.status !== 'Completed') {
  return res.status(400).json({ success: false, message: 'Booking must be Confirmed or Completed before payment' });
}

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Already paid for this booking' });
    }

    // Check if a payment order already exists for this booking
    const existingPayment = await Payment.findOne({ booking_id });
    if (existingPayment && existingPayment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    // Amount calculations
    const baseAmountINR = booking.agreedPrice;
    const platformFeeINR = Math.round(baseAmountINR * (PLATFORM_FEE_PERCENT / 100));
    const totalAmountINR = baseAmountINR + platformFeeINR;

    // Razorpay works in paise (1 INR = 100 paise)
    const amountInPaise = totalAmountINR * 100;

    const receipt = `lg_bk_${booking._id.toString().slice(-8)}_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        booking_id: booking._id.toString(),
        client_id: req.user._id.toString(),
        talent_name: booking.talent_id?.name || '',
        event_date: booking.event_date?.toISOString().split('T')[0],
      },
    });

    // Save or update payment record
    let payment;
    if (existingPayment) {
      existingPayment.razorpay_order_id = razorpayOrder.id;
      existingPayment.base_amount = baseAmountINR * 100;
      existingPayment.platform_fee = platformFeeINR * 100;
      existingPayment.total_amount = amountInPaise;
      existingPayment.status = 'created';
      payment = await existingPayment.save();
    } else {
      payment = await Payment.create({
        booking_id: booking._id,
        client_id: req.user._id,
        talent_id: booking.talent_id._id,
        razorpay_order_id: razorpayOrder.id,
        base_amount: baseAmountINR * 100,
        platform_fee: platformFeeINR * 100,
        total_amount: amountInPaise,
        receipt,
        currency: 'INR',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
        payment_id: payment._id,
        breakdown: {
          base_amount: baseAmountINR,
          platform_fee: platformFeeINR,
          total: totalAmountINR,
        },
        booking: {
          id: booking._id,
          event_date: booking.event_date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          talent_name: booking.talent_id?.name,
        },
      },
    });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// ─── VERIFY PAYMENT ────────────────────────────────────────────────────────────
// POST /api/payments/verify
// Called after Razorpay popup closes successfully
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Signature verification — HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Update payment
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = 'paid';
    payment.paid_at = new Date();
    await payment.save();

    // Update booking paymentStatus
    await Booking.findByIdAndUpdate(payment.booking_id, {
      paymentStatus: 'Paid',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment_id: razorpay_payment_id,
        booking_id: payment.booking_id,
      },
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, message: 'Payment verification error' });
  }
};

// ─── GET PAYMENT BY BOOKING ────────────────────────────────────────────────────
// GET /api/payments/booking/:bookingId
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking_id: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment found for this booking' });
    }
    return res.status(200).json({ success: true, data: payment });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── REFUND ────────────────────────────────────────────────────────────────────
// POST /api/payments/refund
// Admin or system triggers this on cancellation
const refundPayment = async (req, res) => {
  try {
    const { booking_id, reason } = req.body;

    const payment = await Payment.findOne({ booking_id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Can only refund a paid payment' });
    }

    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: payment.total_amount, // full refund in paise
      notes: { reason: reason || 'Booking cancelled', booking_id: booking_id },
    });

    payment.razorpay_refund_id = refund.id;
    payment.refund_amount = payment.total_amount;
    payment.status = 'refunded';
    payment.refunded_at = new Date();
    await payment.save();

    await Booking.findByIdAndUpdate(booking_id, { paymentStatus: 'Refunded' });

    return res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: { refund_id: refund.id },
    });
  } catch (err) {
    console.error('refundPayment error:', err);
    return res.status(500).json({ success: false, message: 'Refund failed' });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentByBooking, refundPayment };