const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, updateUser, deleteUser,
  createAnnouncement, getAnnouncements,
  getUserNotifications, markNotificationRead, getReports
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const adminOnly = [authenticate, authorize('admin')];

router.get('/stats', ...adminOnly, getDashboardStats);
router.get('/users', ...adminOnly, getUsers);
router.put('/users/:id', ...adminOnly, updateUser);
router.delete('/users/:id', ...adminOnly, deleteUser);

router.post('/announcements', ...adminOnly, createAnnouncement);
router.get('/announcements', authenticate, getAnnouncements);

router.get('/notifications', authenticate, getUserNotifications);
router.get('/notifications/:userId', ...adminOnly, getUserNotifications);
router.put('/notifications/:id/read', authenticate, markNotificationRead);

router.get('/reports', ...adminOnly, getReports);

module.exports = router;
