const EventRequest = require('../models/EventRequest.model');
const TalentProfile = require('../models/TalentProfile.model');

// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, skill_needed, event_date, duration, venue, budget, description } = req.body;
    const event = await EventRequest.create({
      user_id: req.user._id,
      title, skill_needed, event_date, duration, venue, budget, description,
    });
    await event.populate('user_id', 'name email profile_pic');
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { skill_needed, status = 'Open', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    if (status) filter.status = status;
    if (skill_needed) filter.skill_needed = { $in: [skill_needed] };

    const [events, total] = await Promise.all([
      EventRequest.find(filter)
        .populate('user_id', 'name profile_pic location')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventRequest.countDocuments(filter),
    ]);

    res.json({ success: true, data: events, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const event = await EventRequest.findById(req.params.id)
      .populate('user_id', 'name email profile_pic')
      .populate('applicants.talent_id');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:id/apply  (TalentProvider applies)
exports.applyToEvent = async (req, res, next) => {
  try {
    const { message, proposedPrice } = req.body;
    const event = await EventRequest.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'Open') return res.status(400).json({ success: false, message: 'Event is not open for applications' });

    const talentProfile = await TalentProfile.findOne({ user_id: req.user._id });
    if (!talentProfile) return res.status(404).json({ success: false, message: 'Create a talent profile first' });

    // Check if already applied
    const alreadyApplied = event.applicants.some(a => a.talent_id.toString() === talentProfile._id.toString());
    if (alreadyApplied) return res.status(409).json({ success: false, message: 'Already applied to this event' });

    event.applicants.push({ talent_id: talentProfile._id, message, proposedPrice });
    await event.save();

    res.json({ success: true, message: 'Application submitted', data: event });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/events/:id/applicants/:applicantId  (Client responds)
exports.respondToApplicant = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'
    const event = await EventRequest.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });

    const applicant = event.applicants.id(req.params.applicantId);
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found' });

    applicant.status = status;
    if (status === 'Accepted') event.status = 'InProgress';
    await event.save();

    res.json({ success: true, message: `Applicant ${status.toLowerCase()}`, data: event });
  } catch (error) {
    next(error);
  }
};
