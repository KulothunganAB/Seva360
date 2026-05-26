const {
  usersDb, complaintsDb, worksDb,
  donationsDb, eventsDb, charityRequestsDb, announcementsDb, notificationsDb
} = require('../database/db');
const { create, getById, getAll, update, remove, getOneBy } = require('../utils/crud');
const { filterByUserDistrict } = require('../utils/district');
const response = require('../utils/response');

/**
 * GET /api/admin/stats - Dashboard analytics
 */
const getDashboardStats = (req, res) => {
  try {
    const users = getAll(usersDb, 'users');
    let complaints = getAll(complaintsDb, 'complaints');
    let works = getAll(worksDb, 'works');
    const donations = getAll(donationsDb, 'donations');
    let events = getAll(eventsDb, 'events');
    let campaigns = getAll(charityRequestsDb, 'charityRequests');

    if (req.user?.role === 'admin') {
      complaints = filterByUserDistrict(complaints, req.user);
      works = filterByUserDistrict(works, req.user);
      events = filterByUserDistrict(events, req.user);
      campaigns = filterByUserDistrict(campaigns, req.user);
    }
    
    const now = new Date();
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    // Complaint stats
    const complaintsByStatus = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    
    const complaintsByCategory = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    
    // Monthly complaints (last 6 months)
    const monthlyComplaints = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const count = complaints.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === year;
      }).length;
      monthlyComplaints.push({ month: `${month} ${year}`, count });
    }
    
    // Works by status
    const worksByStatus = works.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, {});
    
    // Total donations
    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    return response.success(res, {
      overview: {
        totalUsers: users.length,
        totalCitizens: users.filter(u => u.role === 'citizen').length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        district: req.user?.district || 'All',
        totalComplaints: complaints.length,
        openComplaints: complaints.filter(c => c.status === 'open').length,
        resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
        totalWorks: works.length,
        completedWorks: works.filter(w => w.status === 'completed').length,
        totalEvents: events.length,
        totalCampaigns: campaigns.length,
        totalDonations,
        newUsersLast30Days: users.filter(u => new Date(u.createdAt) > last30Days).length,
      },
      complaintsByStatus,
      complaintsByCategory,
      monthlyComplaints,
      worksByStatus,
      recentComplaints: complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
      recentWorks: works.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
      upcomingEvents: events.filter(e => e.status === 'upcoming').slice(0, 5),
      recentDonations: donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    return response.error(res, 'Failed to fetch dashboard stats');
  }
};

/**
 * GET /api/admin/users
 */
const getUsers = (req, res) => {
  try {
    const { role, status, page = 1, limit = 10, q } = req.query;
    let users = getAll(usersDb, 'users');
    
    if (role) users = users.filter(u => u.role === role);
    if (status === 'suspended') users = users.filter(u => u.isSuspended);
    if (status === 'active') users = users.filter(u => !u.isSuspended);
    if (q) {
      const lq = q.toLowerCase();
      users = users.filter(u => u.name?.toLowerCase().includes(lq) || u.email?.toLowerCase().includes(lq));
    }
    
    // Remove passwords
    users = users.map(({ password, ...rest }) => rest);
    users = users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = users.length;
    const offset = (page - 1) * limit;
    const data = users.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return response.error(res, 'Failed to fetch users');
  }
};

/**
 * PUT /api/admin/users/:id
 */
const updateUser = (req, res) => {
  try {
    const { role, isSuspended, isActive } = req.body;
    const user = getById(usersDb, 'users', req.params.id);
    if (!user) return response.notFound(res, 'User not found');
    
    const updateData = {};
    if (role) updateData.role = role;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    usersDb.get('users').find({ id: req.params.id }).assign({ ...updateData, updatedAt: new Date().toISOString() }).write();
    
    const updated = getById(usersDb, 'users', req.params.id);
    const { password, ...userWithoutPassword } = updated;
    return response.success(res, userWithoutPassword, 'User updated');
  } catch (err) {
    return response.error(res, 'Failed to update user');
  }
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = (req, res) => {
  try {
    const user = getById(usersDb, 'users', req.params.id);
    if (!user) return response.notFound(res, 'User not found');
    remove(usersDb, 'users', req.params.id);
    return response.success(res, null, 'User deleted');
  } catch (err) {
    return response.error(res, 'Failed to delete user');
  }
};

/**
 * POST /api/admin/announcements
 */
const createAnnouncement = (req, res) => {
  try {
    const { title, content, targetRole, district, priority } = req.body;
    
    if (!title || !content) return response.badRequest(res, 'Title and content are required');
    
    const announcement = create(announcementsDb, 'announcements', {
      title,
      content,
      targetRole: targetRole || 'all',
      district: district || 'all',
      priority: priority || 'normal',
      isActive: true,
      createdBy: req.user.id,
      createdByName: req.user.name,
      views: 0,
    });
    
    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('newAnnouncement', { announcementId: announcement.id, title, priority });
    }
    
    return response.created(res, announcement, 'Announcement created');
  } catch (err) {
    return response.error(res, 'Failed to create announcement');
  }
};

/**
 * GET /api/admin/announcements
 */
const getAnnouncements = (req, res) => {
  try {
    const announcements = getAll(announcementsDb, 'announcements')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return response.success(res, announcements);
  } catch (err) {
    return response.error(res, 'Failed to fetch announcements');
  }
};

/**
 * GET /api/admin/notifications/:userId
 */
const getUserNotifications = (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const notifications = getAll(notificationsDb, 'notifications')
      .filter(n => n.userId === userId || n.userId === 'admin')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
    
    return response.success(res, notifications);
  } catch (err) {
    return response.error(res, 'Failed to fetch notifications');
  }
};

/**
 * PUT /api/admin/notifications/:id/read
 */
const markNotificationRead = (req, res) => {
  try {
    const notif = getById(notificationsDb, 'notifications', req.params.id);
    if (!notif) return response.notFound(res, 'Notification not found');
    
    update(notificationsDb, 'notifications', req.params.id, { isRead: true });
    return response.success(res, null, 'Notification marked as read');
  } catch (err) {
    return response.error(res, 'Failed to update notification');
  }
};

/**
 * GET /api/admin/reports
 */
const getReports = (req, res) => {
  try {
    const { type, from, to } = req.query;
    let fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let toDate = to ? new Date(to) : new Date();
    
    const complaints = getAll(complaintsDb, 'complaints')
      .filter(c => new Date(c.createdAt) >= fromDate && new Date(c.createdAt) <= toDate);
    
    const works = getAll(worksDb, 'works')
      .filter(w => new Date(w.createdAt) >= fromDate && new Date(w.createdAt) <= toDate);
    
    const donations = getAll(donationsDb, 'donations')
      .filter(d => new Date(d.createdAt) >= fromDate && new Date(d.createdAt) <= toDate);
    
    return response.success(res, {
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      complaints: {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        open: complaints.filter(c => c.status === 'open').length,
      },
      works: {
        total: works.length,
        completed: works.filter(w => w.status === 'completed').length,
        inProgress: works.filter(w => w.status === 'in-progress').length,
      },
      donations: {
        total: donations.reduce((s, d) => s + (d.amount || 0), 0),
        count: donations.length,
      },
    });
  } catch (err) {
    return response.error(res, 'Failed to generate report');
  }
};

module.exports = {
  getDashboardStats, getUsers, updateUser, deleteUser,
  createAnnouncement, getAnnouncements,
  getUserNotifications, markNotificationRead, getReports,
};
