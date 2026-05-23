const { volunteersDb, eventsDb, usersDb } = require('../database/db');
const { create, getById, getAll, update, remove, getOneBy } = require('../utils/crud');
const response = require('../utils/response');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/volunteers
 */
const getVolunteers = (req, res) => {
  try {
    const { district, status, page = 1, limit = 10 } = req.query;
    let volunteers = getAll(volunteersDb, 'volunteers');
    
    if (district) volunteers = volunteers.filter(v => v.district === district);
    if (status) volunteers = volunteers.filter(v => v.status === status);
    
    volunteers = volunteers.sort((a, b) => b.points - a.points);
    
    const total = volunteers.length;
    const offset = (page - 1) * limit;
    const data = volunteers.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return response.error(res, 'Failed to fetch volunteers');
  }
};

/**
 * POST /api/volunteers/register
 */
const registerVolunteer = async (req, res) => {
  try {
    const { district, skills, availability, bio } = req.body;
    const userId = req.user.id;
    
    const existing = getOneBy(volunteersDb, 'volunteers', { userId });
    if (existing) return response.conflict(res, 'Already registered as volunteer');
    
    const user = getById(usersDb, 'users', userId);
    
    // Generate QR code
    const membershipId = `VOL-${uuidv4().slice(0, 8).toUpperCase()}`;
    const qrData = JSON.stringify({ id: membershipId, userId, name: user.name, district });
    const qrCode = await QRCode.toDataURL(qrData);
    
    // Update user role
    usersDb.get('users').find({ id: userId }).assign({ role: 'volunteer', membershipQR: membershipId }).write();
    
    const volunteer = create(volunteersDb, 'volunteers', {
      userId,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      district: district || user.district || 'Chennai',
      skills: skills || [],
      availability: availability || 'weekends',
      bio: bio || '',
      status: 'pending',
      points: 0,
      eventsAttended: [],
      tasksCompleted: [],
      badges: [],
      membershipId,
      qrCode,
      joinedAt: new Date().toISOString(),
    });
    
    return response.created(res, volunteer, 'Volunteer registration submitted for approval');
  } catch (err) {
    console.error(err);
    return response.error(res, 'Failed to register volunteer');
  }
};

/**
 * GET /api/volunteers/me
 */
const getMyVolunteerProfile = (req, res) => {
  try {
    const volunteer = getOneBy(volunteersDb, 'volunteers', { userId: req.user.id });
    if (!volunteer) return response.notFound(res, 'Volunteer profile not found');
    return response.success(res, volunteer);
  } catch (err) {
    return response.error(res, 'Failed to fetch volunteer profile');
  }
};

/**
 * PUT /api/volunteers/:id/status (Admin)
 */
const updateVolunteerStatus = (req, res) => {
  try {
    const { status } = req.body;
    const volunteer = getById(volunteersDb, 'volunteers', req.params.id);
    if (!volunteer) return response.notFound(res, 'Volunteer not found');
    
    const updated = update(volunteersDb, 'volunteers', req.params.id, { status });
    
    // If approved, update user role
    if (status === 'approved') {
      usersDb.get('users').find({ id: volunteer.userId }).assign({ role: 'volunteer' }).write();
    }
    
    return response.success(res, updated, `Volunteer ${status}`);
  } catch (err) {
    return response.error(res, 'Failed to update volunteer status');
  }
};

/**
 * GET /api/volunteers/leaderboard
 */
const getLeaderboard = (req, res) => {
  try {
    const volunteers = getAll(volunteersDb, 'volunteers')
      .filter(v => v.status === 'approved')
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
    
    return response.success(res, volunteers);
  } catch (err) {
    return response.error(res, 'Failed to fetch leaderboard');
  }
};

/**
 * GET /api/events
 */
const getEvents = (req, res) => {
  try {
    const { district, status, page = 1, limit = 10 } = req.query;
    let events = getAll(eventsDb, 'events');
    
    if (district) events = events.filter(e => e.district === district);
    if (status) events = events.filter(e => e.status === status);
    
    events = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const total = events.length;
    const offset = (page - 1) * limit;
    const data = events.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return response.error(res, 'Failed to fetch events');
  }
};

/**
 * POST /api/events
 */
const createEvent = (req, res) => {
  try {
    const { title, description, date, location, district, maxParticipants, eventType, rewards } = req.body;
    
    if (!title || !date || !location) {
      return response.badRequest(res, 'Title, date, and location are required');
    }
    
    const event = create(eventsDb, 'events', {
      title,
      description: description || '',
      date,
      location,
      district: district || 'Chennai',
      eventType: eventType || 'general',
      maxParticipants: Number(maxParticipants) || 100,
      participants: [],
      attendees: [],
      rewards: Number(rewards) || 10,
      status: 'upcoming',
      createdBy: req.user.id,
      createdByName: req.user.name,
      images: [],
    });
    
    // Notify all volunteers
    const io = req.app.get('io');
    if (io) {
      io.emit('newEvent', { eventId: event.id, title, date, district });
    }
    
    return response.created(res, event, 'Event created');
  } catch (err) {
    return response.error(res, 'Failed to create event');
  }
};

/**
 * POST /api/events/:id/register
 */
const registerForEvent = (req, res) => {
  try {
    const event = getById(eventsDb, 'events', req.params.id);
    if (!event) return response.notFound(res, 'Event not found');
    
    const participants = event.participants || [];
    if (participants.includes(req.user.id)) {
      return response.conflict(res, 'Already registered for this event');
    }
    
    if (participants.length >= event.maxParticipants) {
      return response.badRequest(res, 'Event is full');
    }
    
    const updated = update(eventsDb, 'events', req.params.id, {
      participants: [...participants, req.user.id],
    });
    
    return response.success(res, updated, 'Registered for event');
  } catch (err) {
    return response.error(res, 'Failed to register for event');
  }
};

/**
 * POST /api/events/:id/attendance
 */
const markAttendance = (req, res) => {
  try {
    const { volunteerId } = req.body;
    const event = getById(eventsDb, 'events', req.params.id);
    if (!event) return response.notFound(res, 'Event not found');
    
    const attendees = event.attendees || [];
    if (attendees.includes(volunteerId)) {
      return response.conflict(res, 'Attendance already marked');
    }
    
    // Add points to volunteer
    const volunteer = getOneBy(volunteersDb, 'volunteers', { userId: volunteerId });
    if (volunteer) {
      update(volunteersDb, 'volunteers', volunteer.id, {
        points: (volunteer.points || 0) + (event.rewards || 10),
        eventsAttended: [...(volunteer.eventsAttended || []), event.id],
      });
    }
    
    const updated = update(eventsDb, 'events', req.params.id, {
      attendees: [...attendees, volunteerId],
    });
    
    return response.success(res, updated, 'Attendance marked');
  } catch (err) {
    return response.error(res, 'Failed to mark attendance');
  }
};

module.exports = {
  getVolunteers, registerVolunteer, getMyVolunteerProfile,
  updateVolunteerStatus, getLeaderboard,
  getEvents, createEvent, registerForEvent, markAttendance,
};
