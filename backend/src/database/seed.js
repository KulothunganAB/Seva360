require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const {
  usersDb, complaintsDb, worksDb, volunteersDb,
  donationsDb, eventsDb, announcementsDb, charityRequestsDb
} = require('./db');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  console.log('🌱 Seeding Seva360 database...');
  
  // Clear existing data
  usersDb.set('users', []).write();
  complaintsDb.set('complaints', []).write();
  worksDb.set('works', []).write();
  volunteersDb.set('volunteers', []).write();
  donationsDb.set('donations', []).write();
  eventsDb.set('events', []).write();
  announcementsDb.set('announcements', []).write();
  charityRequestsDb.set('charityRequests', []).write();
  
  // Create users
  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('password123', 12);
  
  const adminId = uuidv4();
  const councillorId = uuidv4();
  const citizen1Id = uuidv4();
  const citizen2Id = uuidv4();
  const volunteer1Id = uuidv4();
  
  const users = [
    {
      id: adminId,
      name: 'Admin Seva360',
      email: 'admin@seva360.in',
      password: adminPass,
      phone: '9876543210',
      role: 'admin',
      ward: '',
      district: 'Chennai',
      address: 'Seva360 HQ, Chennai',
      isActive: true,
      isSuspended: false,
      avatar: '',
      volunteerPoints: 0,
      membershipQR: '',
      lastLogin: new Date().toISOString(),
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: councillorId,
      name: 'Councillor Rajesh Kumar',
      email: 'councillor@seva360.in',
      password: userPass,
      phone: '9876543211',
      role: 'councillor',
      ward: 'Ward 12 - Adyar',
      district: 'Chennai',
      address: 'Adyar, Chennai - 600020',
      isActive: true,
      isSuspended: false,
      avatar: '',
      volunteerPoints: 0,
      membershipQR: '',
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: citizen1Id,
      name: 'Priya Lakshmi',
      email: 'citizen@seva360.in',
      password: userPass,
      phone: '9876543212',
      role: 'citizen',
      ward: 'Ward 12 - Adyar',
      district: 'Chennai',
      address: '12/4 Gandhi Nagar, Adyar, Chennai',
      isActive: true,
      isSuspended: false,
      avatar: '',
      volunteerPoints: 0,
      membershipQR: '',
      lastLogin: new Date(Date.now() - 2 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: citizen2Id,
      name: 'Arjun Murugan',
      email: 'arjun@seva360.in',
      password: userPass,
      phone: '9876543213',
      role: 'citizen',
      ward: 'Ward 15 - T Nagar',
      district: 'Chennai',
      address: '45 Pondy Bazaar, T Nagar, Chennai',
      isActive: true,
      isSuspended: false,
      avatar: '',
      volunteerPoints: 50,
      membershipQR: '',
      lastLogin: new Date(Date.now() - 3 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: volunteer1Id,
      name: 'Kavitha Raman',
      email: 'volunteer@seva360.in',
      password: userPass,
      phone: '9876543214',
      role: 'volunteer',
      ward: 'Ward 8 - Anna Nagar',
      district: 'Chennai',
      address: 'Anna Nagar, Chennai - 600040',
      isActive: true,
      isSuspended: false,
      avatar: '',
      volunteerPoints: 150,
      membershipQR: 'VOL-KAVITHA01',
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  users.forEach(u => usersDb.get('users').push(u).write());
  console.log('✅ Users seeded');
  
  // Create complaints
  const categories = ['water', 'roads', 'electricity', 'sanitation', 'welfare', 'public-safety', 'corruption', 'others'];
  const statuses = ['open', 'in-progress', 'resolved', 'closed'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  
  const complaintsData = [
    {
      id: uuidv4(),
      ticketNumber: 'SVA-260512-1001',
      title: 'Broken Road near Adyar Signal',
      description: 'The main road near Adyar traffic signal has large potholes causing accidents. Multiple vehicles have been damaged.',
      category: 'roads',
      priority: 'high',
      status: 'in-progress',
      ward: 'Ward 12 - Adyar',
      address: 'Adyar Signal, Chennai - 600020',
      latitude: 13.0067,
      longitude: 80.2551,
      images: [],
      citizenId: citizen1Id,
      citizenName: 'Priya Lakshmi',
      assignedTo: 'Councillor Rajesh Kumar',
      assignedCouncillorId: councillorId,
      comments: [
        {
          id: uuidv4(),
          text: 'Thank you for reporting. Our team will inspect the site within 48 hours.',
          authorId: councillorId,
          authorName: 'Councillor Rajesh Kumar',
          authorRole: 'councillor',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        }
      ],
      timeline: [
        { id: uuidv4(), status: 'open', message: 'Complaint submitted', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), by: 'Priya Lakshmi' },
        { id: uuidv4(), status: 'in-progress', message: 'Assigned to Councillor Rajesh Kumar', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), by: 'Admin' },
      ],
      rating: null,
      ratingComment: '',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      ticketNumber: 'SVA-260513-1002',
      title: 'No water supply for 3 days',
      description: 'Our entire street has not received water supply for the past 3 days. Residents are suffering especially elderly people.',
      category: 'water',
      priority: 'critical',
      status: 'open',
      ward: 'Ward 15 - T Nagar',
      address: 'Pondy Bazaar North, T Nagar, Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
      images: [],
      citizenId: citizen2Id,
      citizenName: 'Arjun Murugan',
      assignedTo: null,
      assignedCouncillorId: null,
      comments: [],
      timeline: [
        { id: uuidv4(), status: 'open', message: 'Complaint submitted', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), by: 'Arjun Murugan' },
      ],
      rating: null,
      ratingComment: '',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      ticketNumber: 'SVA-260510-1003',
      title: 'Street lights not working - safety concern',
      description: '5 street lights on our road are not working for 2 weeks. Women and elderly feel unsafe at night.',
      category: 'electricity',
      priority: 'medium',
      status: 'resolved',
      ward: 'Ward 12 - Adyar',
      address: 'Gandhi Nagar Street 3, Adyar',
      latitude: 13.0048,
      longitude: 80.2530,
      images: [],
      citizenId: citizen1Id,
      citizenName: 'Priya Lakshmi',
      assignedTo: 'Councillor Rajesh Kumar',
      assignedCouncillorId: councillorId,
      comments: [],
      timeline: [
        { id: uuidv4(), status: 'open', message: 'Complaint submitted', timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), by: 'Priya Lakshmi' },
        { id: uuidv4(), status: 'in-progress', message: 'TANGEDCO team dispatched', timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), by: 'Councillor Rajesh Kumar' },
        { id: uuidv4(), status: 'resolved', message: 'All lights repaired and functional', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), by: 'Councillor Rajesh Kumar' },
      ],
      rating: 4,
      ratingComment: 'Good response! Happy with the resolution.',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];
  
  complaintsData.forEach(c => complaintsDb.get('complaints').push(c).write());
  console.log('✅ Complaints seeded');
  
  // Create works
  const worksData = [
    {
      id: uuidv4(),
      title: 'Adyar Main Road Resurfacing',
      description: 'Complete resurfacing of 2.5 km stretch of Adyar Main Road with new asphalt. Includes drainage work and footpath repair.',
      category: 'roads',
      ward: 'Ward 12 - Adyar',
      address: 'Adyar Main Road, Chennai - 600020',
      budget: 1500000,
      budgetSpent: 750000,
      startDate: new Date(Date.now() - 20 * 86400000).toISOString(),
      expectedEndDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      completedDate: null,
      status: 'in-progress',
      completionPercentage: 60,
      images: [],
      latitude: 13.0067,
      longitude: 80.2551,
      councillorId,
      councillorName: 'Councillor Rajesh Kumar',
      timeline: [
        { id: uuidv4(), status: 'pending', message: 'Project approved and funded', timestamp: new Date(Date.now() - 25 * 86400000).toISOString(), by: 'Admin' },
        { id: uuidv4(), status: 'in-progress', message: 'Work commenced. Old road being cleared.', timestamp: new Date(Date.now() - 20 * 86400000).toISOString(), by: 'Councillor Rajesh Kumar' },
      ],
      citizenFeedback: [
        { id: uuidv4(), text: 'Work is progressing well! Happy to see action.', rating: 4, authorId: citizen1Id, authorName: 'Priya Lakshmi', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Adyar Park Renovation',
      description: 'Renovation of Adyar public park including new benches, lighting, children play area, and landscaping.',
      category: 'welfare',
      ward: 'Ward 12 - Adyar',
      address: 'Adyar Park, Chennai',
      budget: 500000,
      budgetSpent: 500000,
      startDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      expectedEndDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'completed',
      completionPercentage: 100,
      images: [],
      latitude: 13.0020,
      longitude: 80.2540,
      councillorId,
      councillorName: 'Councillor Rajesh Kumar',
      timeline: [
        { id: uuidv4(), status: 'pending', message: 'Project initiated', timestamp: new Date(Date.now() - 50 * 86400000).toISOString(), by: 'Admin' },
        { id: uuidv4(), status: 'completed', message: 'Park fully renovated and opened to public', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), by: 'Councillor Rajesh Kumar' },
      ],
      citizenFeedback: [],
      createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
  
  worksData.forEach(w => worksDb.get('works').push(w).write());
  console.log('✅ Works seeded');
  
  // Create volunteers
  const volunteerData = [
    {
      id: uuidv4(),
      userId: volunteer1Id,
      name: 'Kavitha Raman',
      email: 'volunteer@seva360.in',
      phone: '9876543214',
      district: 'Chennai',
      skills: ['First Aid', 'Event Coordination', 'Data Entry'],
      availability: 'weekends',
      bio: 'Passionate about community service and social welfare.',
      status: 'approved',
      points: 150,
      eventsAttended: [],
      tasksCompleted: [],
      badges: ['Green Star', 'Community Champion'],
      membershipId: 'VOL-KAVITHA01',
      qrCode: '',
      joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: citizen2Id,
      name: 'Arjun Murugan',
      email: 'arjun@seva360.in',
      phone: '9876543213',
      district: 'Chennai',
      skills: ['Teaching', 'Social Media', 'Photography'],
      availability: 'daily',
      bio: 'Youth activist passionate about civic tech and governance transparency.',
      status: 'pending',
      points: 0,
      eventsAttended: [],
      tasksCompleted: [],
      badges: [],
      membershipId: 'VOL-ARJUN001',
      qrCode: '',
      joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  volunteerData.forEach(v => volunteersDb.get('volunteers').push(v).write());
  console.log('✅ Volunteers seeded');
  
  // Create events
  const eventsData = [
    {
      id: uuidv4(),
      title: 'Beach Cleanup Drive - Marina',
      description: 'Join us for a community beach cleanup drive at Marina Beach. Let us keep Chennai clean!',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: 'Marina Beach, Lighthouse End, Chennai',
      district: 'Chennai',
      eventType: 'cleanup',
      maxParticipants: 200,
      participants: [volunteer1Id],
      attendees: [],
      rewards: 25,
      status: 'upcoming',
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      images: [],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Free Health Camp - Blood Pressure & Diabetes Check',
      description: 'Free health screening camp for blood pressure, diabetes and general checkup. Doctors from Govt Hospital participating.',
      date: new Date(Date.now() + 14 * 86400000).toISOString(),
      location: 'Adyar Community Hall, Chennai',
      district: 'Chennai',
      eventType: 'medical-camp',
      maxParticipants: 500,
      participants: [],
      attendees: [],
      rewards: 30,
      status: 'upcoming',
      createdBy: councillorId,
      createdByName: 'Councillor Rajesh Kumar',
      images: [],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Tree Planting Campaign - Green Chennai',
      description: 'Plant trees across Ward 12 to improve the green cover and fight urban heat. 500 saplings ready for planting.',
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      location: 'Ward 12 - Multiple Locations, Adyar',
      district: 'Chennai',
      eventType: 'environment',
      maxParticipants: 100,
      participants: [volunteer1Id, citizen2Id],
      attendees: [volunteer1Id],
      rewards: 20,
      status: 'completed',
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      images: [],
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
  
  eventsData.forEach(e => eventsDb.get('events').push(e).write());
  console.log('✅ Events seeded');
  
  // Create charity campaigns
  const campaignsData = [
    {
      id: uuidv4(),
      title: 'Blood Donation Camp - Critical Need',
      description: 'Urgent need for O+ and AB- blood at Govt General Hospital. Multiple accident victims need blood.',
      type: 'blood-donation',
      targetAmount: 0,
      collectedAmount: 0,
      beneficiary: 'Govt General Hospital Patients',
      district: 'Chennai',
      urgency: 'urgent',
      status: 'active',
      images: [],
      participants: [{ userId: volunteer1Id, name: 'Kavitha Raman', role: 'volunteer', joinedAt: new Date(Date.now() - 86400000).toISOString() }],
      donors: [],
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      approvedBy: adminId,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Scholarship Fund - Merit Students 2024',
      description: 'Financial assistance for 50 merit students from economically weak families pursuing higher education.',
      type: 'scholarship',
      targetAmount: 500000,
      collectedAmount: 175000,
      beneficiary: '50 Merit Students',
      district: 'Chennai',
      urgency: 'normal',
      status: 'active',
      images: [],
      participants: [],
      donors: [
        { donorId: citizen1Id, name: 'Priya Lakshmi', amount: 5000 },
        { donorId: citizen2Id, name: 'Arjun Murugan', amount: 2000 },
      ],
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      approvedBy: adminId,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Food Distribution - Flood Affected Families',
      description: 'Distributing food packages to 200 families affected by recent flooding in North Chennai.',
      type: 'food-distribution',
      targetAmount: 100000,
      collectedAmount: 100000,
      beneficiary: '200 Flood-Affected Families',
      district: 'Chennai',
      urgency: 'urgent',
      status: 'completed',
      images: [],
      participants: [
        { userId: volunteer1Id, name: 'Kavitha Raman', role: 'volunteer', joinedAt: new Date(Date.now() - 10 * 86400000).toISOString() }
      ],
      donors: [],
      createdBy: councillorId,
      createdByName: 'Councillor Rajesh Kumar',
      approvedBy: adminId,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
  
  campaignsData.forEach(c => charityRequestsDb.get('charityRequests').push(c).write());
  console.log('✅ Charity campaigns seeded');
  
  // Create donations
  const donationsData = [
    {
      id: uuidv4(),
      campaignId: campaignsData[1].id,
      campaignTitle: 'Scholarship Fund - Merit Students 2024',
      amount: 5000,
      donorId: citizen1Id,
      donorName: 'Priya Lakshmi',
      paymentMethod: 'upi',
      message: 'For education of deserving students',
      status: 'completed',
      receiptNumber: 'RCP-2024001',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: uuidv4(),
      campaignId: campaignsData[1].id,
      campaignTitle: 'Scholarship Fund - Merit Students 2024',
      amount: 2000,
      donorId: citizen2Id,
      donorName: 'Arjun Murugan',
      paymentMethod: 'online',
      message: '',
      status: 'completed',
      receiptNumber: 'RCP-2024002',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
  
  donationsData.forEach(d => donationsDb.get('donations').push(d).write());
  console.log('✅ Donations seeded');
  
  // Create announcements
  const announcementsData = [
    {
      id: uuidv4(),
      title: 'Water Supply Maintenance - 25th May',
      content: 'Water supply will be interrupted from 9 AM to 5 PM on 25th May 2026 for maintenance of main pipeline in Adyar and T Nagar areas.',
      targetRole: 'all',
      district: 'Chennai',
      priority: 'high',
      isActive: true,
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      views: 145,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Property Tax Due Date Extended',
      content: 'The due date for property tax payment for the year 2026-27 has been extended to 30th June 2026. Citizens can pay online at tnmunicipal.org.',
      targetRole: 'citizen',
      district: 'all',
      priority: 'normal',
      isActive: true,
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      views: 892,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Volunteer Orientation Program - June 1st',
      content: 'All newly approved volunteers are requested to attend the orientation program on June 1st, 2026 at District Collectorate, 10 AM.',
      targetRole: 'volunteer',
      district: 'Chennai',
      priority: 'normal',
      isActive: true,
      createdBy: adminId,
      createdByName: 'Admin Seva360',
      views: 67,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  announcementsData.forEach(a => announcementsDb.get('announcements').push(a).write());
  console.log('✅ Announcements seeded');
  
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin       : admin@seva360.in / admin123');
  console.log('  Councillor  : councillor@seva360.in / password123');
  console.log('  Citizen     : citizen@seva360.in / password123');
  console.log('  Volunteer   : volunteer@seva360.in / password123');
  console.log('  Citizen 2   : arjun@seva360.in / password123');
};

seed().catch(console.error);
