const { worksDb, notificationsDb } = require('../database/db');
const { create, getById, getAll, update, remove } = require('../utils/crud');
const response = require('../utils/response');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/works
 */
const getWorks = (req, res) => {
  try {
    const { status, ward, category, page = 1, limit = 10 } = req.query;
    
    let works = getAll(worksDb, 'works');
    
    if (status) works = works.filter(w => w.status === status);
    if (ward) works = works.filter(w => w.ward === ward);
    if (category) works = works.filter(w => w.category === category);
    
    works = works.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = works.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = works.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages } });
  } catch (err) {
    return response.error(res, 'Failed to fetch works');
  }
};

/**
 * GET /api/works/:id
 */
const getWorkById = (req, res) => {
  try {
    const work = getById(worksDb, 'works', req.params.id);
    if (!work) return response.notFound(res, 'Work not found');
    return response.success(res, work);
  } catch (err) {
    return response.error(res, 'Failed to fetch work');
  }
};

/**
 * POST /api/works
 */
const createWork = (req, res) => {
  try {
    const {
      title, description, category, ward, address,
      budget, startDate, expectedEndDate,
      latitude, longitude, images = []
    } = req.body;
    
    if (!title || !description || !category || !ward) {
      return response.badRequest(res, 'Title, description, category, and ward are required');
    }
    
    const work = create(worksDb, 'works', {
      title,
      description,
      category,
      ward,
      address: address || '',
      budget: Number(budget) || 0,
      budgetSpent: 0,
      startDate: startDate || new Date().toISOString(),
      expectedEndDate: expectedEndDate || null,
      completedDate: null,
      status: 'pending',
      completionPercentage: 0,
      images,
      latitude: latitude || null,
      longitude: longitude || null,
      adminId: req.user.id,
      adminName: req.user.name,
      district: req.user.district || req.body.district || 'Chennai',
      timeline: [
        {
          id: uuidv4(),
          status: 'pending',
          message: 'Work project created',
          timestamp: new Date().toISOString(),
          by: req.user.name,
        }
      ],
      citizenFeedback: [],
      ratings: [],
    });
    
    return response.created(res, work, 'Work created successfully');
  } catch (err) {
    return response.error(res, 'Failed to create work');
  }
};

/**
 * PUT /api/works/:id
 */
const updateWork = (req, res) => {
  try {
    const workId = req.params.id;
    const work = getById(worksDb, 'works', workId);
    if (!work) return response.notFound(res, 'Work not found');
    
    if (req.user.role === 'admin' && work.adminId && work.adminId !== req.user.id && work.district !== req.user.district) {
      return response.forbidden(res);
    }
    
    const {
      title, description, status, completionPercentage,
      budgetSpent, images, message
    } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (completionPercentage !== undefined) updateData.completionPercentage = Number(completionPercentage);
    if (budgetSpent !== undefined) updateData.budgetSpent = Number(budgetSpent);
    if (images) updateData.images = images;
    if (status === 'completed') updateData.completedDate = new Date().toISOString();
    
    if (status) {
      updateData.timeline = [
        ...(work.timeline || []),
        {
          id: uuidv4(),
          status,
          message: message || `Work status updated to ${status}`,
          timestamp: new Date().toISOString(),
          by: req.user.name,
        }
      ];
    }
    
    const updated = update(worksDb, 'works', workId, updateData);
    
    // Broadcast socket
    const io = req.app.get('io');
    if (io) {
      io.emit('workUpdate', { workId, status, completionPercentage });
    }
    
    return response.success(res, updated, 'Work updated');
  } catch (err) {
    return response.error(res, 'Failed to update work');
  }
};

/**
 * POST /api/works/:id/feedback
 */
const addWorkFeedback = (req, res) => {
  try {
    const { text, rating } = req.body;
    const workId = req.params.id;
    
    const work = getById(worksDb, 'works', workId);
    if (!work) return response.notFound(res, 'Work not found');
    
    const feedback = {
      id: uuidv4(),
      text,
      rating: Number(rating) || 0,
      authorId: req.user.id,
      authorName: req.user.name,
      timestamp: new Date().toISOString(),
    };
    
    const updatedFeedback = [...(work.citizenFeedback || []), feedback];
    const updated = update(worksDb, 'works', workId, { citizenFeedback: updatedFeedback });
    
    return response.success(res, updated, 'Feedback submitted');
  } catch (err) {
    return response.error(res, 'Failed to add feedback');
  }
};

/**
 * DELETE /api/works/:id
 */
const deleteWork = (req, res) => {
  try {
    const work = getById(worksDb, 'works', req.params.id);
    if (!work) return response.notFound(res, 'Work not found');
    remove(worksDb, 'works', req.params.id);
    return response.success(res, null, 'Work deleted');
  } catch (err) {
    return response.error(res, 'Failed to delete work');
  }
};

module.exports = { getWorks, getWorkById, createWork, updateWork, addWorkFeedback, deleteWork };
