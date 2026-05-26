const { complaintsDb, notificationsDb, usersDb } = require('../database/db');
const { create, getById, getAll, update, remove, paginate, search } = require('../utils/crud');
const { filterByUserDistrict } = require('../utils/district');
const response = require('../utils/response');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique ticket number
 */
const generateTicketNumber = () => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SVA-${y}${m}${d}-${rand}`;
};

/**
 * GET /api/complaints - Get all complaints (with filters)
 */
const getComplaints = (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority, ward, q } = req.query;
    
    let complaints = getAll(complaintsDb, 'complaints');
    
    if (req.user.role === 'citizen') {
      complaints = complaints.filter(c => c.citizenId === req.user.id);
    } else if (req.user.role === 'admin') {
      complaints = filterByUserDistrict(complaints, req.user);
    }
    
    // Apply filters
    if (status) complaints = complaints.filter(c => c.status === status);
    if (category) complaints = complaints.filter(c => c.category === category);
    if (priority) complaints = complaints.filter(c => c.priority === priority);
    if (ward) complaints = complaints.filter(c => c.ward === ward);
    if (q) {
      const lq = q.toLowerCase();
      complaints = complaints.filter(c =>
        c.title?.toLowerCase().includes(lq) ||
        c.description?.toLowerCase().includes(lq) ||
        c.ticketNumber?.toLowerCase().includes(lq)
      );
    }
    
    // Sort by createdAt desc
    complaints = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginate
    const total = complaints.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = complaints.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages } });
  } catch (err) {
    console.error(err);
    return response.error(res, 'Failed to fetch complaints');
  }
};

/**
 * GET /api/complaints/:id
 */
const getComplaintById = (req, res) => {
  try {
    const complaint = getById(complaintsDb, 'complaints', req.params.id);
    if (!complaint) return response.notFound(res, 'Complaint not found');
    
    // Citizens can only view their own
    if (req.user.role === 'citizen' && complaint.citizenId !== req.user.id) {
      return response.forbidden(res);
    }
    
    return response.success(res, complaint);
  } catch (err) {
    return response.error(res, 'Failed to fetch complaint');
  }
};

/**
 * POST /api/complaints
 */
const createComplaint = (req, res) => {
  try {
    const {
      title, description, category, priority = 'medium',
      ward, address, latitude, longitude, images = []
    } = req.body;
    
    if (!title || !description || !category) {
      return response.badRequest(res, 'Title, description, and category are required');
    }
    
    const user = getById(usersDb, 'users', req.user.id);
    
    const complaint = create(complaintsDb, 'complaints', {
      ticketNumber: generateTicketNumber(),
      title,
      description,
      category,
      priority,
      status: 'open',
      ward: ward || user?.ward || '',
      address: address || user?.address || '',
      latitude: latitude || null,
      longitude: longitude || null,
      images,
      citizenId: req.user.id,
      citizenName: req.user.name,
      assignedTo: null,
      assignedCouncillorId: null,
      comments: [],
      timeline: [
        {
          id: uuidv4(),
          status: 'open',
          message: 'Complaint submitted and registered',
          timestamp: new Date().toISOString(),
          by: req.user.name,
        }
      ],
      rating: null,
      ratingComment: '',
    });
    
    // Create notification for admin
    create(notificationsDb, 'notifications', {
      userId: 'admin',
      title: 'New Complaint',
      message: `New complaint filed: ${title} (${complaint.ticketNumber})`,
      type: 'complaint',
      referenceId: complaint.id,
      isRead: false,
    });
    
    return response.created(res, complaint, 'Complaint submitted successfully');
  } catch (err) {
    console.error(err);
    return response.error(res, 'Failed to create complaint');
  }
};

/**
 * PUT /api/complaints/:id/status
 */
const updateComplaintStatus = (req, res) => {
  try {
    const { status, message } = req.body;
    const complaintId = req.params.id;
    
    const complaint = getById(complaintsDb, 'complaints', complaintId);
    if (!complaint) return response.notFound(res, 'Complaint not found');
    
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return response.badRequest(res, 'Invalid status');
    }
    
    const timelineEntry = {
      id: uuidv4(),
      status,
      message: message || `Status changed to ${status}`,
      timestamp: new Date().toISOString(),
      by: req.user.name,
    };
    
    const updatedTimeline = [...(complaint.timeline || []), timelineEntry];
    const updated = update(complaintsDb, 'complaints', complaintId, {
      status,
      timeline: updatedTimeline,
    });
    
    // Notify citizen
    create(notificationsDb, 'notifications', {
      userId: complaint.citizenId,
      title: 'Complaint Updated',
      message: `Your complaint ${complaint.ticketNumber} status: ${status}`,
      type: 'complaint',
      referenceId: complaintId,
      isRead: false,
    });
    
    // Emit socket event (if io available)
    const io = req.app.get('io');
    if (io) {
      io.to(complaint.citizenId).emit('complaintUpdate', { complaintId, status, message });
    }
    
    return response.success(res, updated, 'Status updated');
  } catch (err) {
    return response.error(res, 'Failed to update status');
  }
};

/**
 * POST /api/complaints/:id/comments
 */
const addComment = (req, res) => {
  try {
    const { text } = req.body;
    const complaintId = req.params.id;
    
    if (!text) return response.badRequest(res, 'Comment text is required');
    
    const complaint = getById(complaintsDb, 'complaints', complaintId);
    if (!complaint) return response.notFound(res, 'Complaint not found');
    
    if (req.user.role === 'citizen' && complaint.citizenId !== req.user.id) {
      return response.forbidden(res);
    }
    
    const comment = {
      id: uuidv4(),
      text,
      authorId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      timestamp: new Date().toISOString(),
    };
    
    const updatedComments = [...(complaint.comments || []), comment];
    const updated = update(complaintsDb, 'complaints', complaintId, { comments: updatedComments });
    
    return response.success(res, updated, 'Comment added');
  } catch (err) {
    return response.error(res, 'Failed to add comment');
  }
};

/**
 * POST /api/complaints/:id/rate
 */
const rateComplaint = (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaintId = req.params.id;
    
    const complaint = getById(complaintsDb, 'complaints', complaintId);
    if (!complaint) return response.notFound(res, 'Complaint not found');
    if (complaint.citizenId !== req.user.id) return response.forbidden(res);
    if (complaint.status !== 'resolved') return response.badRequest(res, 'Can only rate resolved complaints');
    
    const updated = update(complaintsDb, 'complaints', complaintId, {
      rating: Number(rating),
      ratingComment: comment || '',
    });
    
    return response.success(res, updated, 'Rating submitted');
  } catch (err) {
    return response.error(res, 'Failed to rate complaint');
  }
};

/**
 * DELETE /api/complaints/:id
 */
const deleteComplaint = (req, res) => {
  try {
    const complaint = getById(complaintsDb, 'complaints', req.params.id);
    if (!complaint) return response.notFound(res, 'Complaint not found');
    
    if (req.user.role === 'citizen' && complaint.citizenId !== req.user.id) {
      return response.forbidden(res);
    }
    
    remove(complaintsDb, 'complaints', req.params.id);
    return response.success(res, null, 'Complaint deleted');
  } catch (err) {
    return response.error(res, 'Failed to delete complaint');
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  addComment,
  rateComplaint,
  deleteComplaint,
};
