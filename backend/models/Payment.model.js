const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    talent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TalentProfile',
      required: true,
    },

    // Razorpay IDs
    razorpay_order_id: { type: String, required: true, unique: true },
    razorpay_payment_id: { type: String, default: null },
    razorpay_signature: { type: String, default: null },
    razorpay_refund_id: { type: String, default: null },

    // Amount breakdown (all in paise — multiply ₹ by 100)
    base_amount: { type: Number, required: true },       // agreedPrice in paise
    platform_fee: { type: Number, required: true },      // 10% cut
    total_amount: { type: Number, required: true },      // base + platform_fee
    refund_amount: { type: Number, default: 0 },

    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
    },

    paid_at: { type: Date, default: null },
    refunded_at: { type: Date, default: null },

    // For display / receipts
    receipt: { type: String },
    notes: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

paymentSchema.index({ booking_id: 1 });
paymentSchema.index({ client_id: 1 });
paymentSchema.index({ razorpay_order_id: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;