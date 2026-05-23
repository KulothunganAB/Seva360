const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../database');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Create individual adapters for each collection
const createAdapter = (filename) => {
  const filePath = path.join(DB_DIR, filename);
  const adapter = new FileSync(filePath);
  const db = low(adapter);
  return db;
};

// Initialize all databases
const usersDb = createAdapter('users.json');
const complaintsDb = createAdapter('complaints.json');
const worksDb = createAdapter('works.json');
const volunteersDb = createAdapter('volunteers.json');
const donationsDb = createAdapter('donations.json');
const eventsDb = createAdapter('events.json');
const announcementsDb = createAdapter('announcements.json');
const notificationsDb = createAdapter('notifications.json');
const feedbackDb = createAdapter('feedback.json');
const charityRequestsDb = createAdapter('charityRequests.json');

// Set defaults for each database
usersDb.defaults({ users: [] }).write();
complaintsDb.defaults({ complaints: [] }).write();
worksDb.defaults({ works: [] }).write();
volunteersDb.defaults({ volunteers: [] }).write();
donationsDb.defaults({ donations: [] }).write();
eventsDb.defaults({ events: [] }).write();
announcementsDb.defaults({ announcements: [] }).write();
notificationsDb.defaults({ notifications: [] }).write();
feedbackDb.defaults({ feedback: [] }).write();
charityRequestsDb.defaults({ charityRequests: [] }).write();

module.exports = {
  usersDb,
  complaintsDb,
  worksDb,
  volunteersDb,
  donationsDb,
  eventsDb,
  announcementsDb,
  notificationsDb,
  feedbackDb,
  charityRequestsDb,
};
