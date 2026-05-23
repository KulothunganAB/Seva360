import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth guard
import ProtectedRoute from './components/auth/ProtectedRoute';

// Eager-loaded pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Lazy-loaded pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ComplaintsManagement = lazy(() => import('./pages/admin/ComplaintsManagement'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));

const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const MyComplaints = lazy(() => import('./pages/citizen/MyComplaints'));
const NewComplaint = lazy(() => import('./pages/citizen/NewComplaint'));
const ComplaintDetail = lazy(() => import('./pages/citizen/ComplaintDetail'));
const PublicWorks = lazy(() => import('./pages/citizen/PublicWorks'));

const CouncillorDashboard = lazy(() => import('./pages/councillor/CouncillorDashboard'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const CharityPortal = lazy(() => import('./pages/charity/CharityPortal'));
const EventsPage = lazy(() => import('./pages/common/EventsPage'));
const MapView = lazy(() => import('./pages/common/MapView'));
const Settings = lazy(() => import('./pages/common/Settings'));

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const RedirectToDashboard = () => {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const map = { admin: '/admin', councillor: '/councillor', citizen: '/citizen', volunteer: '/volunteer' };
  return <Navigate to={map[user?.role] || '/citizen'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Login />} />
          </Route>
          
          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<ProtectedRoute><RedirectToDashboard /></ProtectedRoute>} />
          
          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<ComplaintsManagement />} />
            <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/works" element={<PublicWorks />} />
            <Route path="/admin/volunteers" element={<VolunteerDashboard />} />
            <Route path="/admin/events" element={<EventsPage />} />
            <Route path="/admin/charity" element={<CharityPortal />} />
            <Route path="/admin/announcements" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            <Route path="/admin/map" element={<MapView />} />
            <Route path="/admin/reports" element={<AdminDashboard />} />
          </Route>
          
          {/* Councillor */}
          <Route element={<ProtectedRoute roles={['councillor', 'admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/councillor" element={<CouncillorDashboard />} />
            <Route path="/councillor/complaints" element={<ComplaintsManagement />} />
            <Route path="/councillor/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/councillor/works" element={<PublicWorks />} />
            <Route path="/councillor/events" element={<EventsPage />} />
            <Route path="/councillor/charity" element={<CharityPortal />} />
            <Route path="/councillor/map" element={<MapView />} />
          </Route>
          
          {/* Citizen */}
          <Route element={<ProtectedRoute roles={['citizen', 'volunteer', 'admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/complaints" element={<MyComplaints />} />
            <Route path="/citizen/new-complaint" element={<NewComplaint />} />
            <Route path="/citizen/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/citizen/works" element={<PublicWorks />} />
            <Route path="/citizen/events" element={<EventsPage />} />
            <Route path="/citizen/charity" element={<CharityPortal />} />
            <Route path="/citizen/map" element={<MapView />} />
          </Route>
          
          {/* Volunteer */}
          <Route element={<ProtectedRoute roles={['volunteer', 'citizen', 'admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/volunteer" element={<VolunteerDashboard />} />
            <Route path="/volunteer/events" element={<EventsPage />} />
            <Route path="/volunteer/membership" element={<VolunteerDashboard />} />
            <Route path="/volunteer/leaderboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer/charity" element={<CharityPortal />} />
          </Route>
          
          {/* Shared Settings */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-dark-950 flex items-center justify-center text-center px-4">
              <div>
                <h1 className="text-8xl font-extrabold text-primary-700 font-poppins">404</h1>
                <p className="text-dark-300 text-xl mt-4">Page not found</p>
                <a href="/" className="btn btn-primary mt-6 inline-flex">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
