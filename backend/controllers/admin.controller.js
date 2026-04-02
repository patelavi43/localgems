const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const TalentProfile = require('../models/TalentProfile.model');
const Review = require('../models/Review.model');
const EventRequest = require('../models/EventRequest.model');

// ─── GET /api/admin/analytics ────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTalents,
      totalBookings,
      totalRevenue,
      popularCategories,
      recentBookings,
      recentReviews,
      bookingsByStatus,
      monthlyBookings,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      TalentProfile.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
        { $group: { _id: null, total: { $sum: '$agreedPrice' } } },
      ]),
      TalentProfile.aggregate([
        { $unwind: '$skill_type' },
        { $group: { _id: '$skill_type', count: { $sum: 1 }, avgRating: { $avg: '$rating.average' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Booking.find()
        .populate('user_id', 'name email')
        .populate({ path: 'talent_id', populate: { path: 'user_id', select: 'name' } })
        .sort({ created_at: -1 })
        .limit(5),
      Review.find()
        .populate('user_id', 'name profile_pic')
        .populate({ path: 'talent_id', populate: { path: 'user_id', select: 'name' } })
        .sort({ created_at: -1 })
        .limit(5),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: {
              year:  { $year: '$created_at' },
              month: { $month: '$created_at' },
            },
            count:   { $sum: 1 },
            revenue: { $sum: '$agreedPrice' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalTalents,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        popularCategories,
        recentBookings,
        recentReviews,
        bookingsByStatus,
        monthlyBookings: monthlyBookings.reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name:  new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];

    const [users, total] = await Promise.all([
      User.find(filter).sort({ created_at: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page:  parseInt(page),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/admin/users/:id/toggle ───────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/talents/pending ──────────────────────────
// Returns all talent profiles waiting for admin approval
exports.getPendingTalents = async (req, res, next) => {
  try {
    const pending = await TalentProfile.find({
      verificationStatus: 'pending',
    })
      .populate('user_id', 'name email profile_pic createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/admin/talents/:id/verify ─────────────────────
// Admin approves or rejects a talent profile by TalentProfile _id
exports.verifyTalent = async (req, res, next) => {
  try {
    const { action, note } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be 'approved' or 'rejected'",
      });
    }

    const profile = await TalentProfile.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          verificationStatus: action,
          isVerified:         action === 'approved', // true only if approved
          verificationNote:   note || '',
        },
      },
      { new: true }
    ).populate('user_id', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Talent profile not found',
      });
    }

    res.json({
      success: true,
      message: `Talent ${action} successfully`,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};