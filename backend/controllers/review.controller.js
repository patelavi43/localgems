const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');
const TalentProfile = require('../models/TalentProfile.model');

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { booking_id, rating, review_text } = req.body;

    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Must be the client who made the booking
    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can review this booking' });
    }

    // Booking must be completed
    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    // Check for existing review
    const existing = await Review.findOne({ booking_id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Review already submitted for this booking' });
    }

    const review = await Review.create({
      user_id: req.user._id,
      talent_id: booking.talent_id,
      booking_id,
      rating,
      review_text,
    });

    // Link review to booking
    booking.reviewId = review._id;
    await booking.save();

    await review.populate('user_id', 'name profile_pic');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/talent/:talentId
exports.getTalentReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const talent = await TalentProfile.findById(req.params.talentId);
    if (!talent) return res.status(404).json({ success: false, message: 'Talent not found' });

    const [reviews, total] = await Promise.all([
      Review.find({ talent_id: req.params.talentId, isPublic: true })
        .populate('user_id', 'name profile_pic')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ talent_id: req.params.talentId, isPublic: true }),
    ]);

    res.json({
      success: true,
      data: reviews,
      stats: { averageRating: talent.rating.average, totalReviews: talent.rating.count },
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};
