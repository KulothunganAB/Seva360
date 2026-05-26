import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiHome, FiAlertCircle, FiTool, FiUsers, FiHeart,
  FiCalendar, FiMapPin, FiSettings, FiX, FiFileText,
  FiCheckCircle, FiGlobe, FiPlusCircle
} from 'react-icons/fi';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const sidebarLinks = {
  admin: [
    { to: '/admin', icon: FiHome, labelKey: 'dashboard', id: 'admin-dashboard' },
    { to: '/admin/users', icon: FiUsers, labelKey: 'users', id: 'admin-users' },
    { to: '/admin/complaints', icon: FiAlertCircle, labelKey: 'complaints', id: 'admin-complaints' },
    { to: '/admin/works', icon: FiTool, labelKey: 'publicWorks', id: 'admin-works' },
    { to: '/admin/events', icon: FiPlusCircle, labelKey: 'manageEvents', id: 'admin-events' },
    { to: '/admin/charity', icon: FiHeart, labelKey: 'manageCharity', id: 'admin-charity' },
    { to: '/admin/map', icon: FiMapPin, labelKey: 'map', id: 'admin-map' },
    { to: '/settings', icon: FiSettings, labelKey: 'settings', id: 'admin-settings' },
  ],
  citizen: [
    { to: '/citizen', icon: FiHome, labelKey: 'dashboard', id: 'citizen-dashboard' },
    { to: '/citizen/complaints', icon: FiAlertCircle, labelKey: 'myComplaints', id: 'citizen-complaints' },
    { to: '/citizen/new-complaint', icon: FiFileText, labelKey: 'fileComplaint', id: 'citizen-new-complaint' },
    { to: '/citizen/works', icon: FiCheckCircle, labelKey: 'publicWorks', id: 'citizen-works' },
    { to: '/citizen/events', icon: FiCalendar, labelKey: 'events', id: 'citizen-events' },
    { to: '/citizen/charity', icon: FiHeart, labelKey: 'charity', id: 'citizen-charity' },
    { to: '/citizen/map', icon: FiMapPin, labelKey: 'map', id: 'citizen-map' },
    { to: '/settings', icon: FiSettings, labelKey: 'settings', id: 'citizen-settings' },
  ],
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const { sidebarOpen } = useSelector(state => state.ui);

  const links = sidebarLinks[user?.role] || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-primary-800/50 dark:border-primary-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-primary-800 dark:text-white font-bold text-lg font-poppins">S</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg font-poppins leading-tight">{t('appName')}</h1>
            <p className="text-blue-200 text-xs">{t('smartGovernance')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-primary-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <span className="text-xs text-blue-200 font-medium capitalize">
              {user?.role === 'admin' ? t('districtAdmin') : t('citizen')}
            </span>
            {user?.district && (
              <p className="text-[10px] text-blue-300 truncate">{user.district}</p>
            )}
          </div>
        </div>
      </div>

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
              <span>{t(link.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-800/50">
        <NavLink to="/" className="sidebar-link" id="sidebar-home">
          <FiGlobe className="w-4 h-4" />
          <span>{t('publicPortal')}</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar hidden lg:flex" id="sidebar-desktop">
        <SidebarContent />
      </aside>

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
                className="absolute top-4 right-4 p-2 rounded-lg text-blue-200 hover:text-white hover:bg-primary-800 transition-colors"
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
