# Seva360 — Full-Stack Governance Platform

> **Smart Governance • Public Service • Citizen Engagement**

A production-ready civic-tech platform for Tamil Nadu citizens, councillors, volunteers and administrators.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone / open project folder
cd Seva360

# Install backend dependencies
cd backend
npm install

# Seed the database with sample data
npm run seed

# Start backend (port 5000)
npm run dev

# In a new terminal — install & start frontend
cd ../frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@seva360.in | admin123 |
| Councillor | councillor@seva360.in | password123 |
| Citizen | citizen@seva360.in | password123 |
| Volunteer | volunteer@seva360.in | password123 |

---

## 📁 Folder Structure

```
Seva360/
├── backend/
│   ├── database/          ← JSON data files (auto-created)
│   ├── src/
│   │   ├── controllers/   ← Business logic
│   │   ├── database/      ← DB adapter + seed
│   │   ├── middleware/    ← Auth, error handling
│   │   ├── routes/        ← API routes
│   │   ├── utils/         ← CRUD, JWT, response helpers
│   │   └── index.js       ← Express + Socket.io server
│   ├── uploads/           ← Uploaded files
│   ├── .env               ← Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/      ← ProtectedRoute
│   │   │   ├── common/    ← Navbar, Sidebar
│   │   │   └── ui/        ← Reusable UI components
│   │   ├── layouts/       ← DashboardLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── admin/     ← Admin dashboard, users, complaints
│   │   │   ├── auth/      ← Login, Register
│   │   │   ├── charity/   ← Charity portal
│   │   │   ├── citizen/   ← Citizen dashboard, complaints, works
│   │   │   ├── common/    ← Events, Map, Settings
│   │   │   ├── councillor/← Councillor dashboard
│   │   │   ├── volunteer/ ← Volunteer dashboard
│   │   │   └── Landing.jsx← Public landing page
│   │   ├── services/      ← Axios API, Socket.io client
│   │   ├── store/         ← Redux Toolkit store + slices
│   │   ├── App.jsx        ← Router
│   │   └── main.jsx       ← Entry point
│   └── package.json
└── README.md
```

---

## 🔌 API Documentation

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | List complaints (with filters) |
| GET | `/api/complaints/:id` | Get complaint by ID |
| POST | `/api/complaints` | Create complaint |
| PUT | `/api/complaints/:id/status` | Update status |
| POST | `/api/complaints/:id/comments` | Add comment |

### Works
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/works` | List works |
| POST | `/api/works` | Create work project |
| PUT | `/api/works/:id` | Update work |
| POST | `/api/works/:id/feedback` | Add feedback |

### Volunteers & Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/volunteers/register` | Register as volunteer |
| GET | `/api/volunteers/leaderboard` | Points leaderboard |
| GET | `/api/volunteers/events` | List events |
| POST | `/api/volunteers/events/:id/register` | Register for event |

### Charity
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/charity/campaigns` | List campaigns |
| POST | `/api/charity/campaigns` | Create campaign |
| POST | `/api/charity/campaigns/:id/participate` | Join campaign |
| POST | `/api/charity/donations` | Make donation |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id` | Update user (role/suspend) |
| POST | `/api/admin/announcements` | Create announcement |
| GET | `/api/admin/reports` | Generate reports |

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🎨 Tech Stack

### Frontend
- **React 18** + **Vite 5**
- **Tailwind CSS 3** — custom design system
- **Redux Toolkit** — state management
- **React Router 6** — routing
- **Framer Motion** — animations
- **Recharts** — analytics charts
- **React Leaflet** — interactive maps
- **Socket.io Client** — real-time updates
- **React Hot Toast** — notifications

### Backend
- **Node.js** + **Express.js**
- **lowdb** — local JSON file database
- **JWT** — authentication
- **bcryptjs** — password hashing
- **Socket.io** — real-time bidirectional communication
- **Helmet** + **CORS** + **Rate Limiting** — security

---

## 🔒 Security Features
- JWT access + refresh tokens
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min global, 20 auth)
- Helmet security headers
- XSS protection (xss-clean)
- CORS whitelist
- Role-based access control (RBAC)
- Input validation

---

## 📦 Production Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render)
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Set all `.env` variables in Render dashboard

---

## 🐳 Docker

```bash
# Build and run everything
docker-compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

---

## 📋 Features

### ✅ Implemented
- [x] JWT auth with role-based access (Admin, Councillor, Citizen, Volunteer)
- [x] Citizen grievance portal with ticket generation + timeline
- [x] Public works tracking with progress bars
- [x] Volunteer registration + QR membership + points system
- [x] Event management + registration
- [x] Charity campaigns + inline donations
- [x] Admin analytics dashboard with Recharts
- [x] Real-time notifications via Socket.io
- [x] Interactive map (Leaflet) for geo-tagged issues
- [x] Dark/Light mode
- [x] Responsive design (mobile-first)
- [x] Animated landing page
- [x] Seed data with realistic test records

---

## 🤝 Roles & Capabilities

| Feature | Admin | Councillor | Citizen | Volunteer |
|---------|-------|-----------|---------|-----------|
| Dashboard Analytics | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| File Complaints | ✅ | ✅ | ✅ | ✅ |
| Update Complaint Status | ✅ | ✅ | ❌ | ❌ |
| Create Works | ✅ | ✅ | ❌ | ❌ |
| Create Events | ✅ | ✅ | ❌ | ❌ |
| QR Membership | ❌ | ❌ | ❌ | ✅ |
| Points Leaderboard | ✅ | ✅ | ✅ | ✅ |
| Donate to Campaigns | ✅ | ✅ | ✅ | ✅ |
| Post Announcements | ✅ | ❌ | ❌ | ❌ |

---

*Built with ❤️ for Tamil Nadu — Seva360 v1.0.0*
