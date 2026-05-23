import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiAlertCircle, FiTool, FiUsers, FiHeart,
  FiCalendar, FiBell, FiBarChart2, FiSettings, FiX,
  FiFileText, FiMapPin, FiAward, FiShield, FiActivity,
  FiCheckCircle, FiGlobe
} from 'react-icons/fi';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const sidebarLinks = {
  admin: [
    { to: '/admin', icon: FiHome, label: 'Dashboard', id: 'admin-dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Users', id: 'admin-users' },
    { to: '/admin/complaints', icon: FiAlertCircle, label: 'Complaints', id: 'admin-complaints' },
    { to: '/admin/works', icon: FiTool, label: 'Works', id: 'admin-works' },
    { to: '/admin/volunteers', icon: FiAward, label: 'Volunteers', id: 'admin-volunteers' },
    { to: '/admin/events', icon: FiCalendar, label: 'Events', id: 'admin-events' },
    { to: '/admin/charity', icon: FiHeart, label: 'Charity', id: 'admin-charity' },
    { to: '/admin/announcements', icon: FiBell, label: 'Announcements', id: 'admin-announcements' },
    { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics', id: 'admin-analytics' },
    { to: '/admin/map', icon: FiMapPin, label: 'Map View', id: 'admin-map' },
    { to: '/admin/reports', icon: FiFileText, label: 'Reports', id: 'admin-reports' },
    { to: '/settings', icon: FiSettings, label: 'Settings', id: 'admin-settings' },
  ],
  councillor: [
    { to: '/councillor', icon: FiHome, label: 'Dashboard', id: 'councillor-dashboard' },
    { to: '/councillor/complaints', icon: FiAlertCircle, label: 'Complaints', id: 'councillor-complaints' },
    { to: '/councillor/works', icon: FiTool, label: 'My Works', id: 'councillor-works' },
    { to: '/councillor/events', icon: FiCalendar, label: 'Events', id: 'councillor-events' },
    { to: '/councillor/charity', icon: FiHeart, label: 'Charity', id: 'councillor-charity' },
    { to: '/councillor/map', icon: FiMapPin, label: 'Ward Map', id: 'councillor-map' },
    { to: '/settings', icon: FiSettings, label: 'Settings', id: 'councillor-settings' },
  ],
  citizen: [
    { to: '/citizen', icon: FiHome, label: 'Dashboard', id: 'citizen-dashboard' },
    { to: '/citizen/complaints', icon: FiAlertCircle, label: 'My Complaints', id: 'citizen-complaints' },
    { to: '/citizen/new-complaint', icon: FiFileText, label: 'File Complaint', id: 'citizen-new-complaint' },
    { to: '/citizen/works', icon: FiCheckCircle, label: 'Public Works', id: 'citizen-works' },
    { to: '/citizen/events', icon: FiCalendar, label: 'Events', id: 'citizen-events' },
    { to: '/citizen/charity', icon: FiHeart, label: 'Charity', id: 'citizen-charity' },
    { to: '/citizen/map', icon: FiMapPin, label: 'Map', id: 'citizen-map' },
    { to: '/settings', icon: FiSettings, label: 'Settings', id: 'citizen-settings' },
  ],
  volunteer: [
    { to: '/volunteer', icon: FiHome, label: 'Dashboard', id: 'volunteer-dashboard' },
    { to: '/volunteer/events', icon: FiCalendar, label: 'Events', id: 'volunteer-events' },
    { to: '/volunteer/membership', icon: FiAward, label: 'My QR Card', id: 'volunteer-membership' },
    { to: '/volunteer/leaderboard', icon: FiActivity, label: 'Leaderboard', id: 'volunteer-leaderboard' },
    { to: '/volunteer/charity', icon: FiHeart, label: 'Charity', id: 'volunteer-charity' },
    { to: '/citizen/complaints', icon: FiAlertCircle, label: 'Complaints', id: 'volunteer-complaints' },
    { to: '/settings', icon: FiSettings, label: 'Settings', id: 'volunteer-settings' },
  ],
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { sidebarOpen } = useSelector(state => state.ui);
  
  const links = sidebarLinks[user?.role] || [];
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dark-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg font-poppins">S</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg font-poppins leading-tight">Seva360</h1>
            <p className="text-dark-400 text-xs">Smart Governance</p>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-4 border-b border-dark-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <span className="text-xs text-primary-400 font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to || 
            (link.to !== `/${user?.role}` && location.pathname.startsWith(link.to));
          
          return (
            <NavLink
              key={link.id}
              to={link.to}
              id={link.id}
              className={({ isActive: navActive }) =>
                `sidebar-link ${navActive || isActive ? 'active' : ''}`
              }
              onClick={() => dispatch(setSidebarOpen(false))}
              end={link.to === `/${user?.role}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-dark-800/50">
        <NavLink
          to="/"
          className="sidebar-link"
          id="sidebar-home"
        >
          <FiGlobe className="w-4 h-4" />
          <span>Public Portal</span>
        </NavLink>
        <div className="mt-3 text-center">
          <p className="text-dark-500 text-xs">Seva360 v1.0.0</p>
          <p className="text-dark-600 text-[10px]">Smart Governance Platform</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden lg:flex" id="sidebar-desktop">
        <SidebarContent />
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => dispatch(setSidebarOpen(false))}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="sidebar lg:hidden flex z-50"
              id="sidebar-mobile"
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                onClick={() => dispatch(setSidebarOpen(false))}
                id="sidebar-close"
              >
                <FiX className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
