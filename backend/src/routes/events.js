const express = require('express');
const router = express.Router();
const { getEvents, createEvent, registerForEvent, deleteEvent } = require('../controllers/eventsController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getEvents);
router.post('/', authenticate, authorize('admin'), createEvent);
router.post('/:id/register', authenticate, authorize('citizen', 'admin'), registerForEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);

module.exports = router;
