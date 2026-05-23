import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiTool, FiCheckCircle, FiFileText, FiPlus } from 'react-icons/fi';
import { StatCard, StatusBadge, PriorityBadge } from '../../components/ui';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const CouncillorDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints?limit=5'),
      api.get('/works?limit=5'),
    ]).then(([cr, wr]) => {
      setComplaints(cr.data.data || []);
      setWorks(wr.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Councillor Dashboard</h1>
          <p className="page-subtitle">{user?.name} • {user?.ward || user?.district}</p>
        </div>
        <Link to="/councillor/works/new" className="btn btn-primary btn-sm" id="create-work-btn">
          <FiPlus /> New Work
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={complaints.length} icon={FiAlertCircle} color="primary" loading={loading} />
        <StatCard title="Open" value={complaints.filter(c => c.status === 'open').length} icon={FiAlertCircle} color="warning" loading={loading} />
        <StatCard title="Total Works" value={works.length} icon={FiTool} color="info" loading={loading} />
        <StatCard title="Completed" value={works.filter(w => w.status === 'completed').length} icon={FiCheckCircle} color="success" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800 dark:text-white text-sm">Ward Complaints</h3>
            <Link to="/councillor/complaints" className="text-xs text-primary-600 hover:underline" id="view-all-ward-complaints">View all</Link>
          </div>
          {complaints.map(c => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700 last:border-0">
              <div>
                <p className="text-sm font-medium text-dark-700 dark:text-dark-200 truncate max-w-xs">{c.title}</p>
                <p className="text-xs text-dark-400">{c.ticketNumber} • {c.citizenName}</p>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>

        {/* My Works */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800 dark:text-white text-sm">My Works</h3>
            <Link to="/councillor/works" className="text-xs text-primary-600 hover:underline" id="view-all-my-works">View all</Link>
          </div>
          {works.map(w => (
            <div key={w.id} className="py-3 border-b border-gray-100 dark:border-dark-700 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{w.title}</p>
                <StatusBadge status={w.status} />
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-dark-700 rounded-full">
                <div className="h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" style={{ width: `${w.completionPercentage}%` }} />
              </div>
              <p className="text-xs text-dark-400 mt-1">{w.completionPercentage}% • {w.ward}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CouncillorDashboard;
