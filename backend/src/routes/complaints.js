const express = require('express');
const router = express.Router();
const {
  getComplaints, getComplaintById, createComplaint,
  updateComplaintStatus, addComment, rateComplaint, deleteComplaint
} = require('../controllers/complaintsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.post('/', authenticate, createComplaint);
router.put('/:id/status', authenticate, authorize('admin'), updateComplaintStatus);
router.post('/:id/comments', authenticate, addComment);
router.post('/:id/rate', authenticate, authorize('citizen'), rateComplaint);
router.delete('/:id', authenticate, deleteComplaint);

module.exports = router;
