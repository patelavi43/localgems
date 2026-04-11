const Booking = require('../models/Booking.model');
const TalentProfile = require('../models/TalentProfile.model');

// ─── Create Booking ───────────────────────────────────────────
// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { talent_id, event_date, startTime, endTime, eventType, venue, agreedPrice, notes } = req.body;

    // Validate talent exists
    const talent = await TalentProfile.findOne({ _id: talent_id, isActive: true });
    if (!talent) {
      return res.status(404).json({ success: false, message: 'Talent not found' });
    }

    // Prevent booking own profile
    if (talent.user_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot book yourself' });
    }

    // Check for conflicting bookings on same date+time
    const conflicting = await Booking.findOne({
      talent_id,
      event_date: new Date(event_date),
      startTime,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (conflicting) {
      return res.status(409).json({ success: false, message: 'This talent is not available at the requested time' });
    }

    const booking = await Booking.create({
      user_id: req.user._id,
      talent_id,
      event_date,
      startTime,
      endTime,
      eventType,
      venue,
      agreedPrice: agreedPrice || talent.hourlyRate,
      currency: talent.currency,
      notes,
    });

    await booking.populate([
      { path: 'user_id', select: 'name email profile_pic' },
      { path: 'talent_id', select: 'skill_type hourlyRate user_id', populate: { path: 'user_id', select: 'name profile_pic' } },
    ]);

    // Increment total bookings count
    await TalentProfile.findByIdAndUpdate(talent_id, { $inc: { totalBookings: 1 } });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Bookings ──────────────────────────────────────────
// GET /api/bookings/me
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'Client') {
      filter.user_id = req.user._id;
    } else if (req.user.role === 'TalentProvider') {
      const profile = await TalentProfile.findOne({ user_id: req.user._id });
      if (!profile) return res.json({ success: true, data: [], pagination: { total: 0 } });
      filter.talent_id = profile._id;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user_id', 'name email profile_pic phone')
        .populate({
          path: 'talent_id',
          select: 'skill_type hourlyRate user_id location',
          populate: { path: 'user_id', select: 'name profile_pic' },
        })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user_id', 'name email profile_pic phone')
      .populate({
        path: 'talent_id',
        populate: { path: 'user_id', select: 'name email profile_pic phone' },
      });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only participants can view
    const talentUserId = booking.talent_id?.user_id?._id?.toString();
    const clientId = booking.user_id?._id?.toString();
    const requesterId = req.user._id.toString();

    if (req.user.role !== 'Admin' && requesterId !== clientId && requesterId !== talentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ─── Update Booking Status ─────────────────────────────────────
// PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id).populate({
      path: 'talent_id',
      select: 'user_id',
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const talentUserId = booking.talent_id?.user_id?.toString();
    const clientId = booking.user_id?.toString();
    const requesterId = req.user._id.toString();

    // Authorization: only talent provider can confirm/complete; client or talent can cancel
    const isTalent = requesterId === talentUserId;
    const isClient = requesterId === clientId;

    if (!isTalent && !isClient && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate status transitions
    const validTransitions = {
      Pending: ['Confirmed', 'Canceled'],
      Confirmed: ['Completed', 'Canceled'],
      Completed: [],
      Canceled: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${booking.status}' to '${status}'`,
      });
    }

    // Only talent can confirm/complete
    if (['Confirmed', 'Completed'].includes(status) && !isTalent && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only the talent provider can confirm or complete bookings' });
    }

    booking.status = status;
    if (status === 'Canceled') {
      booking.cancellationReason = cancellationReason || 'No reason provided';
      booking.canceledBy = req.user._id;
    }
    await booking.save();

    res.json({ success: true, data: booking, message: `Booking ${status.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};
