const { eventsDb } = require('../database/db');
const { create, getById, getAll, update } = require('../utils/crud');
const { filterByUserDistrict, assertAdminDistrict } = require('../utils/district');
const response = require('../utils/response');

const getEvents = (req, res) => {
  try {
    const { status, page = 1, limit = 50, district: queryDistrict } = req.query;
    let events = getAll(eventsDb, 'events');

    if (req.user) {
      events = filterByUserDistrict(events, req.user);
    } else if (queryDistrict) {
      events = events.filter((e) => e.district === queryDistrict);
    }

    if (status) events = events.filter((e) => e.status === status);
    events = events.sort((a, b) => new Date(a.date) - new Date(b.date));

    const total = events.length;
    const offset = (page - 1) * limit;
    const data = events.slice(offset, Number(offset) + Number(limit));

    return response.paginated(res, {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return response.error(res, 'Failed to fetch events');
  }
};

const createEvent = (req, res) => {
  try {
    const {
      title, description, date, location, district,
      maxParticipants, eventType, latitude, longitude,
    } = req.body;

    if (!title || !date || !location) {
      return response.badRequest(res, 'Title, date, and location are required');
    }

    const eventDistrict = district || req.user.district || 'Chennai';
    if (!assertAdminDistrict(req.user, eventDistrict)) {
      return response.forbidden(res, 'You can only create events in your assigned district');
    }

    const event = create(eventsDb, 'events', {
      title,
      description: description || '',
      date,
      location,
      district: eventDistrict,
      eventType: eventType || 'general',
      maxParticipants: Number(maxParticipants) || 100,
      participants: [],
      status: 'upcoming',
      createdBy: req.user.id,
      createdByName: req.user.name,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      images: [],
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`district:${eventDistrict}`).emit('newEvent', { eventId: event.id, title, date, district: eventDistrict });
    }

    return response.created(res, event, 'Event created');
  } catch (err) {
    return response.error(res, 'Failed to create event');
  }
};

const registerForEvent = (req, res) => {
  try {
    const event = getById(eventsDb, 'events', req.params.id);
    if (!event) return response.notFound(res, 'Event not found');

    if (req.user.role === 'citizen' && event.district !== req.user.district) {
      return response.forbidden(res, 'This event is outside your district');
    }

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

const deleteEvent = (req, res) => {
  try {
    const event = getById(eventsDb, 'events', req.params.id);
    if (!event) return response.notFound(res, 'Event not found');
    if (!assertAdminDistrict(req.user, event.district)) {
      return response.forbidden(res, 'Cannot delete events outside your district');
    }
    eventsDb.get('events').remove({ id: req.params.id }).write();
    return response.success(res, null, 'Event deleted');
  } catch (err) {
    return response.error(res, 'Failed to delete event');
  }
};

module.exports = { getEvents, createEvent, registerForEvent, deleteEvent };
