const TalentProfile = require('../models/TalentProfile.model');
const User = require('../models/User.model');

// ─── Search / List Talents — GET /api/talent ─────────────────
exports.searchTalent = async (req, res, next) => {
  try {
    const {
      skill_type,
      location,
      ratingMin,
      budgetMin,
      budgetMax,
      availability,
      page = 1,
      limit = 12,
      sort = '-rating.average',
    } = req.query;

    const filter = { isActive: true, isVerified: true };

    // Filter by skill type
    if (skill_type) {
      filter.skill_type = {
        $in: Array.isArray(skill_type) ? skill_type : [skill_type],
      };
    }

    // Filter by location (city, state, or country)
    if (location) {
      filter.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') },
      ];
    }

    // Filter by minimum rating
    if (ratingMin) {
      filter['rating.average'] = { $gte: parseFloat(ratingMin) };
    }

    // Filter by hourly rate range
    if (budgetMin || budgetMax) {
      filter.hourlyRate = {};
      if (budgetMin) filter.hourlyRate.$gte = parseFloat(budgetMin);
      if (budgetMax) filter.hourlyRate.$lte = parseFloat(budgetMax);
    }

    // Filter by availability date — FIX: use separate Date objects to avoid mutation bug
    if (availability) {
      const availDate = new Date(availability);
      const startOfDay = new Date(availDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(availDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.availability = {
        $elemMatch: {
          date: { $gte: startOfDay, $lte: endOfDay },
          isBooked: false,
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [talents, total] = await Promise.all([
      TalentProfile.find(filter)
        .populate('user_id', 'name profile_pic location') // FIX: profilepic → profile_pic
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      TalentProfile.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: talents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Talent — GET /api/talent/:id ─────────────────
exports.getTalentById = async (req, res, next) => {
  try {
    const talent = await TalentProfile.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate('user_id', 'name email profile_pic location phone createdAt'); // FIX: profilepic → profile_pic

    if (!talent) {
      return res.status(404).json({
        success: false,
        message: 'Talent profile not found',
      });
    }

    res.json({ success: true, data: talent });
  } catch (error) {
    next(error);
  }
};

// ─── Create / Update Talent Profile — POST /api/talent ───────
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Parse JSON strings sent inside FormData
    const skill_type = req.body.skill_type
      ? JSON.parse(req.body.skill_type)
      : [];
    const experience = req.body.experience
      ? JSON.parse(req.body.experience)
      : {};
    const location = req.body.location
      ? JSON.parse(req.body.location)
      : {};
    const languages = req.body.languages
      ? JSON.parse(req.body.languages)
      : [];
    const tags = req.body.tags
      ? JSON.parse(req.body.tags)
      : [];
    const contact_info = req.body.contact_info
      ? JSON.parse(req.body.contact_info)
      : {};

    const { bio, hourlyRate, currency } = req.body;

    const profileData = {
      skill_type,
      bio,
      experience,
      hourlyRate,
      currency,
      location,
      languages,
      tags,
      contact_info,
    };

    // Save uploaded image paths if present
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

if (req.files?.profilePhoto?.[0]) {
  profileData.profilePhoto = `${BASE_URL}/uploads/${req.files.profilePhoto[0].filename}`;
}
if (req.files?.backgroundImage?.[0]) {
  profileData.backgroundImage = `${BASE_URL}/uploads/${req.files.backgroundImage[0].filename}`;
}

    const existing = await TalentProfile.findOne({ user_id: userId });
    let profile;

    if (existing) {
      profile = await TalentProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: profileData },
        { new: true, runValidators: true }
      ).populate('user_id', 'name email profile_pic'); // FIX: profilepic → profile_pic
    } else {
      profile = await TalentProfile.create({ user_id: userId, ...profileData });
      await profile.populate('user_id', 'name email profile_pic'); // FIX: profilepic → profile_pic
    }

    res.status(existing ? 200 : 201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// ─── Update Availability — PATCH /api/talent/:id/availability ─
exports.updateAvailability = async (req, res, next) => {
  try {
    // FIX: destructure from req.body — frontend sends { availability: [...] }
    const { availability } = req.body;

    const profile = await TalentProfile.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or unauthorized',
      });
    }

    profile.availability = availability;
    await profile.save();

    res.json({
      success: true,
      data: profile.availability,
      message: 'Availability updated',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Profile — GET /api/talent/me ─────────────────────
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await TalentProfile.findOne({ user_id: req.user.id })
      .populate('user_id', 'name email profile_pic phone location'); // FIX: profilepic → profile_pic

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No talent profile found. Please create one.',
      });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// ─── Add Portfolio Item — POST /api/talent/portfolio ─────────
exports.addPortfolioItem = async (req, res, next) => {
  try {
    const { title, description, mediaUrl, mediaType } = req.body;

    const profile = await TalentProfile.findOneAndUpdate(
      { user_id: req.user.id },
      { $push: { portfolio: { title, description, mediaUrl, mediaType } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Talent profile not found',
      });
    }

    res.json({ success: true, data: profile.portfolio });
  } catch (error) {
    next(error);
  }
};