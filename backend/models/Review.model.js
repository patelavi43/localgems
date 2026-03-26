const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    talent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TalentProfile',
      required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review_text: {
      type: String,
      maxlength: [1000, 'Review text cannot exceed 1000 characters'],
    },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

reviewSchema.index({ talent_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ rating: -1 });

// After saving a review, update talent's average rating
reviewSchema.post('save', async function () {
  const TalentProfile = require('./TalentProfile.model');
  const Review = this.constructor;

  const stats = await Review.aggregate([
    { $match: { talent_id: this.talent_id } },
    {
      $group: {
        _id: '$talent_id',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await TalentProfile.findByIdAndUpdate(this.talent_id, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
