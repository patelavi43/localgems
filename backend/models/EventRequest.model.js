const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    skill_needed: {
      type: [String],
      required: [true, 'At least one skill is needed'],
    },
    event_date: { type: Date, required: true },
    duration: { type: Number }, // hours
    venue: {
      name: String,
      city: String,
      country: String,
    },
    budget: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    description: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ['Open', 'InProgress', 'Closed'],
      default: 'Open',
    },
    applicants: [
      {
        talent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TalentProfile' },
        message: String,
        proposedPrice: Number,
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Rejected'],
          default: 'Pending',
        },
      },
    ],
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

eventRequestSchema.index({ status: 1 });
eventRequestSchema.index({ skill_needed: 1 });
eventRequestSchema.index({ event_date: 1 });
eventRequestSchema.index({ user_id: 1 });

const EventRequest = mongoose.model('EventRequest', eventRequestSchema);
module.exports = EventRequest;
