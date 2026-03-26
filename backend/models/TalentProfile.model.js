const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "17:00"
  isBooked: { type: Boolean, default: false },
});

const portfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  mediaUrl: String, // image or video URL
  mediaType: { type: String, enum: ['image', 'video', 'link'], default: 'image' },
});

const talentProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One profile per user
    },
    skill_type: {
      type: [String],
      required: [true, 'At least one skill type is required'],
      enum: [
        'Singer', 'Dancer', 'Musician', 'Actor', 'Comedian',
        'Athlete', 'Teacher', 'Photographer', 'Videographer',
        'Chef', 'DJ', 'Magician', 'Speaker', 'Fitness Trainer', 'Other'
      ],
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    experience: {
      years: { type: Number, min: 0, max: 50, default: 0 },
      description: String,
    },
    portfolio: [portfolioItemSchema],
    availability: [availabilitySlotSchema],
    contact_info: {
      phone: String,
      website: String,
      instagram: String,
      youtube: String,
    },
    hourlyRate: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: { type: String, default: 'USD' },
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    languages: [String],
    tags: [String],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalBookings: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for search performance
talentProfileSchema.index({ skill_type: 1 });
talentProfileSchema.index({ 'rating.average': -1 });
talentProfileSchema.index({ 'location.city': 1, 'location.country': 1 });
talentProfileSchema.index({ hourlyRate: 1 });
talentProfileSchema.index({ isActive: 1, 'rating.average': -1 });
talentProfileSchema.index({ tags: 1 });

const TalentProfile = mongoose.model('TalentProfile', talentProfileSchema);
module.exports = TalentProfile;
