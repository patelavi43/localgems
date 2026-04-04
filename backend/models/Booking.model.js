const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client user ID is required'],
    },
    talent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TalentProfile',
      required: [true, 'Talent profile ID is required'],
    },
    event_date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: { type: String, required: true },
    endTime: { type: String },
    eventType: { type: String, trim: true },
    venue: {
      name: String,
      address: String,
      city: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Canceled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'],
      default: 'Unpaid',
    },
    agreedPrice: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'INR' },
    notes: { type: String, maxlength: 500 },
    cancellationReason: { type: String },
    canceledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

bookingSchema.index({ user_id: 1, status: 1 });
bookingSchema.index({ talent_id: 1, status: 1 });
bookingSchema.index({ event_date: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
