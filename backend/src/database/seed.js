require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const {
  usersDb, complaintsDb, worksDb,
  donationsDb, eventsDb, announcementsDb, charityRequestsDb
} = require('./db');
const { v4: uuidv4 } = require('uuid');

const DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'];

const DISTRICT_COORDS = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  Salem: { lat: 11.6643, lng: 78.1460 },
};

const seed = async () => {
  console.log('🌱 Seeding Seva360 database (Admin + Citizen, district-wise)...');

  usersDb.set('users', []).write();
  complaintsDb.set('complaints', []).write();
  worksDb.set('works', []).write();
  donationsDb.set('donations', []).write();
  eventsDb.set('events', []).write();
  announcementsDb.set('announcements', []).write();
  charityRequestsDb.set('charityRequests', []).write();

  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('password123', 12);

  const adminIds = {};
  const citizenIds = {};

  const users = [];

  DISTRICTS.forEach((district) => {
    const adminId = uuidv4();
    const citizenId = uuidv4();
    adminIds[district] = adminId;
    citizenIds[district] = citizenId;

    const slug = district.toLowerCase().replace(/\s/g, '');
    users.push({
      id: adminId,
      name: `${district} District Admin`,
      email: `admin.${slug}@seva360.in`,
      password: adminPass,
      phone: `98765${String(DISTRICTS.indexOf(district)).padStart(5, '0')}`,
      role: 'admin',
      ward: '',
      district,
      address: `District Collectorate, ${district}`,
      isActive: true,
      isSuspended: false,
      avatar: '',
      lastLogin: new Date().toISOString(),
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    users.push({
      id: citizenId,
      name: `${district} Citizen`,
      email: `citizen.${slug}@seva360.in`,
      password: userPass,
      phone: `98766${String(DISTRICTS.indexOf(district)).padStart(5, '0')}`,
      role: 'citizen',
      ward: `Ward 1 - ${district}`,
      district,
      address: `Main Street, ${district}`,
      isActive: true,
      isSuspended: false,
      avatar: '',
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  users.forEach((u) => usersDb.get('users').push(u).write());
  console.log('✅ Users seeded (5 district admins + 5 citizens)');

  const complaintTemplates = [
    { title: 'Potholes on main road', category: 'roads', priority: 'high', status: 'open' },
    { title: 'Water supply interrupted', category: 'water', priority: 'critical', status: 'in-progress' },
    { title: 'Street lights not working', category: 'electricity', priority: 'medium', status: 'resolved' },
    { title: 'Garbage not collected', category: 'sanitation', priority: 'high', status: 'open' },
    { title: 'Drainage overflow', category: 'sanitation', priority: 'critical', status: 'in-progress' },
    { title: 'Broken footpath', category: 'roads', priority: 'low', status: 'open' },
  ];

  let ticketNum = 1001;
  DISTRICTS.forEach((district) => {
    const coords = DISTRICT_COORDS[district];
    const citizenId = citizenIds[district];
    const citizen = users.find((u) => u.id === citizenId);

    complaintTemplates.forEach((tpl, idx) => {
      const offset = (idx - 2) * 0.012;
      complaintsDb.get('complaints').push({
        id: uuidv4(),
        ticketNumber: `SVA-2605${DISTRICTS.indexOf(district) + 1}-${ticketNum++}`,
        title: `${tpl.title} - ${district}`,
        description: `Reported in ${district}. Requires district admin attention.`,
        category: tpl.category,
        priority: tpl.priority,
        status: tpl.status,
        district,
        ward: `Ward ${idx + 1} - ${district}`,
        address: `${district} Main Area`,
        latitude: coords.lat + offset,
        longitude: coords.lng + offset * 0.8,
        images: [],
        citizenId,
        citizenName: citizen.name,
        assignedTo: `${district} District Admin`,
        assignedAdminId: adminIds[district],
        comments: [],
        timeline: [
          {
            id: uuidv4(),
            status: 'open',
            message: 'Complaint submitted',
            timestamp: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
            by: citizen.name,
          },
        ],
        rating: tpl.status === 'resolved' ? 4 : null,
        ratingComment: '',
        createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }).write();
    });
  });
  console.log('✅ Complaints seeded (30 geo-tagged across districts)');

  DISTRICTS.forEach((district) => {
    const coords = DISTRICT_COORDS[district];
    worksDb.get('works').push({
      id: uuidv4(),
      title: `${district} Road Improvement`,
      description: `Public works project in ${district}`,
      category: 'roads',
      district,
      ward: `Ward 1 - ${district}`,
      address: `${district} Central`,
      budget: 800000,
      budgetSpent: 400000,
      startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      expectedEndDate: new Date(Date.now() + 20 * 86400000).toISOString(),
      completedDate: null,
      status: 'in-progress',
      completionPercentage: 50,
      images: [],
      latitude: coords.lat + 0.008,
      longitude: coords.lng - 0.006,
      adminId: adminIds[district],
      adminName: `${district} District Admin`,
      timeline: [],
      citizenFeedback: [],
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    }).write();
  });
  console.log('✅ Works seeded');

  const eventTypes = ['cleanup', 'medical-camp', 'environment', 'general', 'welfare'];
  DISTRICTS.forEach((district, dIdx) => {
    const coords = DISTRICT_COORDS[district];
    const adminId = adminIds[district];
    const admin = users.find((u) => u.id === adminId);

    for (let i = 0; i < 3; i++) {
      eventsDb.get('events').push({
        id: uuidv4(),
        title: [`${district} Beach Cleanup`, `${district} Health Camp`, `${district} Tree Planting`][i],
        description: `Community event in ${district} district.`,
        date: new Date(Date.now() + (i + 1) * 7 * 86400000).toISOString(),
        location: `${district} Community Center`,
        district,
        eventType: eventTypes[(dIdx + i) % eventTypes.length],
        maxParticipants: 150,
        participants: i === 0 ? [citizenIds[district]] : [],
        status: i === 2 ? 'completed' : 'upcoming',
        createdBy: adminId,
        createdByName: admin.name,
        latitude: coords.lat + i * 0.015,
        longitude: coords.lng + i * 0.01,
        images: [],
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }).write();
    }
  });
  console.log('✅ Events seeded (15 with map coordinates)');

  const charityTypes = ['blood-donation', 'scholarship', 'food-distribution', 'medical-camp', 'welfare'];
  DISTRICTS.forEach((district, dIdx) => {
    const coords = DISTRICT_COORDS[district];
    const adminId = adminIds[district];
    const admin = users.find((u) => u.id === adminId);

    for (let i = 0; i < 2; i++) {
      charityRequestsDb.get('charityRequests').push({
        id: uuidv4(),
        title: [`${district} Blood Donation Drive`, `${district} Student Scholarship`][i],
        description: `Charity initiative for ${district} residents.`,
        type: charityTypes[(dIdx + i) % charityTypes.length],
        targetAmount: i === 0 ? 0 : 300000,
        collectedAmount: i === 0 ? 0 : 85000,
        beneficiary: `${district} residents`,
        district,
        urgency: i === 0 ? 'urgent' : 'normal',
        status: 'active',
        images: [],
        participants: [],
        donors: [],
        latitude: coords.lat - 0.01 + i * 0.008,
        longitude: coords.lng + 0.012,
        createdBy: adminId,
        createdByName: admin.name,
        approvedBy: adminId,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      }).write();
    }
  });
  console.log('✅ Charity campaigns seeded');

  DISTRICTS.forEach((district) => {
    announcementsDb.get('announcements').push({
      id: uuidv4(),
      title: `${district} - Public Notice`,
      content: `Important announcement for all citizens in ${district} district.`,
      targetRole: 'citizen',
      district,
      priority: 'normal',
      isActive: true,
      createdBy: adminIds[district],
      createdByName: `${district} District Admin`,
      views: Math.floor(Math.random() * 200) + 50,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    }).write();
  });
  console.log('✅ Announcements seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials (password: admin123 for admins, password123 for citizens):');
  DISTRICTS.forEach((d) => {
    const slug = d.toLowerCase().replace(/\s/g, '');
    console.log(`  Admin ${d.padEnd(16)}: admin.${slug}@seva360.in`);
    console.log(`  Citizen ${d.padEnd(13)}: citizen.${slug}@seva360.in`);
  });
};

seed().catch(console.error);
