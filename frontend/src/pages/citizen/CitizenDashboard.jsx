import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiTool, FiCheckCircle, FiActivity, FiFileText, FiCalendar } from 'react-icons/fi';
import { StatCard, StatusBadge, PriorityBadge } from '../../components/ui';
import api from '../../services/api';

const CitizenDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [myComplaints, setMyComplaints] = useState([]);
  const [recentWorks, setRecentWorks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints?limit=5'),
      api.get('/works?limit=5&status=in-progress'),
      api.get('/events?limit=3&status=upcoming'),
    ]).then(([cr, wr, er]) => {
      setMyComplaints(cr.data.data || []);
      setRecentWorks(wr.data.data || []);
      setEvents(er.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const resolved = myComplaints.filter(c => c.status === 'resolved').length;
  const open = myComplaints.filter(c => c.status === 'open').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Hello, {user?.name} • {user?.ward || user?.district}</p>
        </div>
        <Link to="/citizen/new-complaint" className="btn btn-primary" id="file-complaint-btn">
          <FiFileText className="w-4 h-4" /> File Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="My Complaints" value={myComplaints.length} icon={FiAlertCircle} color="primary" loading={loading} />
        <StatCard title="Open" value={open} icon={FiActivity} color="warning" loading={loading} />
        <StatCard title="Resolved" value={resolved} icon={FiCheckCircle} color="success" loading={loading} />
        <StatCard title="Active Works" value={recentWorks.length} icon={FiTool} color="info" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Complaints */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800 dark:text-white text-sm">My Recent Complaints</h3>
            <Link to="/citizen/complaints" className="text-xs text-primary-600 hover:underline" id="view-my-complaints">View all</Link>
          </div>
          {myComplaints.length === 0 ? (
            <div className="py-10 text-center">
              <FiAlertCircle className="w-10 h-10 text-dark-300 mx-auto mb-3" />
              <p className="text-sm text-dark-400">No complaints yet.</p>
              <Link to="/citizen/new-complaint" className="btn btn-primary btn-sm mt-3" id="file-first-complaint">File Your First Complaint</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myComplaints.map(c => (
                <Link key={c.id} to={`/citizen/complaints/${c.id}`} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-800/50 -mx-2 px-2 rounded-lg transition-colors" id={`complaint-${c.id}`}>
                  <div>
                    <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{c.title}</p>
                    <p className="text-xs text-dark-400">{c.ticketNumber} • {c.category}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800 dark:text-white text-sm">Upcoming Events</h3>
            <Link to="/citizen/events" className="text-xs text-primary-600 hover:underline" id="view-events">View all</Link>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-dark-400 py-8 text-center">No upcoming events</p>
          ) : events.map(e => (
            <div key={e.id} className="flex gap-3 py-3 border-b border-gray-100 dark:border-dark-700 last:border-0">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiCalendar className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{e.title}</p>
                <p className="text-xs text-dark-400">{new Date(e.date).toLocaleDateString('en-IN')}</p>
                <p className="text-xs text-dark-400">{e.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public Works */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-800 dark:text-white text-sm">Works in Your Area</h3>
          <Link to="/citizen/works" className="text-xs text-primary-600 hover:underline" id="view-works">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {recentWorks.map(w => (
            <div key={w.id} className="p-4 border border-gray-100 dark:border-dark-700 rounded-xl hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-dark-700 dark:text-dark-200 truncate">{w.title}</p>
                <StatusBadge status={w.status} />
              </div>
              <p className="text-xs text-dark-400 mb-3">{w.ward}</p>
              <div className="h-1.5 bg-gray-100 dark:bg-dark-700 rounded-full">
                <div className="h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all" style={{ width: `${w.completionPercentage}%` }} />
              </div>
              <p className="text-xs text-dark-400 mt-1">{w.completionPercentage}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
