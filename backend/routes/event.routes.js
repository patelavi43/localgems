const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, applyToEvent, respondToApplicant } = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', getEvents);
router.post('/', protect, authorize('Client'), createEvent);
router.get('/:id', getEventById);
router.post('/:id/apply', protect, authorize('TalentProvider'), applyToEvent);
router.patch('/:id/applicants/:applicantId', protect, authorize('Client'), respondToApplicant);

module.exports = router;
