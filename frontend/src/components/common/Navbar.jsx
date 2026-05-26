import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiMenu, FiSun, FiMoon, FiUser, FiLogOut, 
  FiSettings, FiSearch, FiX, FiChevronDown, FiGlobe
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../i18n';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme, toggleSidebar, markNotificationRead } from '../../store/slices/uiSlice';
import { Avatar } from '../ui';
import api from '../../services/api';

const Navbar = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { theme, unreadCount, notifications } = useSelector(state => state.ui);
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const notifsRef = useRef(null);
  const profileRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleReadNotification = async (notifId) => {
    try {
      await api.put(`/admin/notifications/${notifId}/read`);
      dispatch(markNotificationRead(notifId));
    } catch {}
  };
  
  const roleColors = {
    admin: 'from-primary-600 to-primary-800',
    citizen: 'from-blue-500 to-blue-700',
  };
  
  const roleLabel = {
    admin: 'District Admin',
    citizen: 'Citizen',
  };
  
  return (
    <header className="h-16 bg-white dark:bg-black border-b border-gray-100 dark:border-primary-900 flex items-center px-4 gap-4 sticky top-0 z-30 shadow-sm">
      {/* Hamburger */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="btn btn-ghost p-2 lg:hidden"
        id="nav-menu-toggle"
        aria-label="Toggle menu"
      >
        <FiMenu className="w-5 h-5" />
      </button>
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mr-4 hidden lg:flex">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="font-bold text-primary-700 dark:text-primary-400 font-poppins">Seva360</span>
      </Link>
      
      {/* Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search complaints, works, events..."
            className="input pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-dark-800 border-transparent focus:bg-white dark:focus:bg-dark-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="nav-search"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        {/* Search mobile */}
        <button className="btn btn-ghost p-2 md:hidden" onClick={() => setShowSearch(!showSearch)}>
          {showSearch ? <FiX /> : <FiSearch />}
        </button>
        
        <button
          onClick={() => setLanguage(i18n.language === 'ta' ? 'en' : 'ta')}
          className="btn btn-ghost p-2 text-xs font-medium"
          id="lang-toggle-nav"
          title="Language"
        >
          <FiGlobe className="w-4 h-4" />
          <span className="hidden sm:inline">{i18n.language === 'ta' ? 'EN' : 'தமிழ்'}</span>
        </button>

        <button
          onClick={() => dispatch(toggleTheme())}
          className="btn btn-ghost p-2"
          id="theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun className="w-4 h-4 text-gold-500" /> : <FiMoon className="w-4 h-4" />}
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="btn btn-ghost p-2 relative"
            id="notifications-btn"
            aria-label="Notifications"
          >
            <FiBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 card shadow-xl border border-gray-100 dark:border-dark-700 z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="badge badge-primary">{unreadCount} new</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-dark-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-50 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer transition-colors ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                        onClick={() => handleReadNotification(notif.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-primary-600'}`} />
                          <div>
                            <p className="text-sm font-medium text-dark-800 dark:text-dark-100">{notif.title}</p>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-dark-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
            id="profile-menu-btn"
          >
            <Avatar name={user?.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-dark-800 dark:text-dark-100 leading-tight">{user?.name}</p>
              <p className="text-xs text-dark-400">{roleLabel[user?.role] || user?.role}</p>
            </div>
            <FiChevronDown className="w-3 h-3 text-dark-400 hidden md:block" />
          </button>
          
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 card shadow-xl z-50 overflow-hidden"
              >
                <div className={`p-4 bg-gradient-to-r ${roleColors[user?.role] || 'from-primary-600 to-primary-800'} text-white`}>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs opacity-80 mt-0.5">{user?.email}</p>
                  <span className="mt-2 inline-block text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {roleLabel[user?.role]}
                  </span>
                </div>
                <div className="p-2">
                  <Link
                    to={`/${user?.role}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 transition-colors"
                    onClick={() => setShowProfile(false)}
                    id="go-dashboard-link"
                  >
                    <FiUser className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-200 transition-colors"
                    onClick={() => setShowProfile(false)}
                    id="settings-link"
                  >
                    <FiSettings className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-100 dark:border-dark-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 w-full transition-colors"
                    id="logout-btn"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 right-0 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-800 px-4 py-3 md:hidden z-30"
          >
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="input pl-9"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
