const express = require('express');
const router = express.Router();
const { getWorks, getWorkById, createWork, updateWork, addWorkFeedback, deleteWork } = require('../controllers/worksController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getWorks);
router.get('/:id', optionalAuth, getWorkById);
router.post('/', authenticate, authorize('admin', 'councillor'), createWork);
router.put('/:id', authenticate, authorize('admin', 'councillor'), updateWork);
router.post('/:id/feedback', authenticate, addWorkFeedback);
router.delete('/:id', authenticate, authorize('admin'), deleteWork);

module.exports = router;
