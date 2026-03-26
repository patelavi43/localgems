const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const TalentProfile = require('../models/TalentProfile.model');

/**
 * Generate signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Build safe user response (no password)
 */
const userResponse = (user, token) => ({
  success: true,
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    profile_pic: user.profile_pic,
    created_at: user.created_at,
  },
});

// ─── Register ─────────────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Only allow Client or TalentProvider on public registration
    const allowedRoles = ['Client', 'TalentProvider'];
    const userRole = allowedRoles.includes(role) ? role : 'Client';

    const user = await User.create({ name, email, password, role: userRole, phone, location });
    const token = generateToken(user._id);

    res.status(201).json(userResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json(userResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ───────────────────────────────────────────────────
// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let talentProfile = null;
    if (user.role === 'TalentProvider') {
      talentProfile = await TalentProfile.findOne({ user_id: user._id }).lean();
    }
    res.json({ success: true, user, talentProfile });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ───────────────────────────────────────────
// PATCH /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, profile_pic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location, profile_pic },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ──────────────────────────────────────────
// PATCH /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
