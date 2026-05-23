const express = require('express');
const router = express.Router();
const {
  getVolunteers, registerVolunteer, getMyVolunteerProfile,
  updateVolunteerStatus, getLeaderboard,
  getEvents, createEvent, registerForEvent, markAttendance
} = require('../controllers/volunteerController');
const { authenticate, authorize } = require('../middleware/auth');

// Volunteers
router.get('/', authenticate, getVolunteers);
router.post('/register', authenticate, registerVolunteer);
router.get('/me', authenticate, getMyVolunteerProfile);
router.get('/leaderboard', getLeaderboard);
router.put('/:id/status', authenticate, authorize('admin'), updateVolunteerStatus);

// Events
router.get('/events', getEvents);
router.post('/events', authenticate, authorize('admin', 'councillor'), createEvent);
router.post('/events/:id/register', authenticate, registerForEvent);
router.post('/events/:id/attendance', authenticate, authorize('admin', 'councillor'), markAttendance);

module.exports = router;
