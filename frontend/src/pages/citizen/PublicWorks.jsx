import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiDollarSign, FiTool } from 'react-icons/fi';
import { StatusBadge, Pagination, EmptyState } from '../../components/ui';
import api from '../../services/api';

const PublicWorks = () => {
  const [works, setWorks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 9 });

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
    api.get(`/works?${new URLSearchParams(params)}`).then(r => {
      setWorks(r.data.data || []);
      setPagination(r.data.pagination);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filters]);

  const statusFilter = ['', 'pending', 'in-progress', 'completed', 'delayed'];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <h1 className="page-title">Public Works</h1>
        <p className="page-subtitle">Track infrastructure projects in your ward</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFilter.map(s => (
          <button key={s} onClick={() => setFilters({ ...filters, status: s, page: 1 })} className={`btn btn-sm capitalize ${filters.status === s ? 'btn-primary' : 'btn-ghost border border-gray-200 dark:border-dark-600'}`} id={`filter-works-${s || 'all'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}</div>
      ) : works.length === 0 ? (
        <EmptyState icon={FiTool} title="No works found" description="No public works match your filter." />
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {works.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-hover p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-gray capitalize">{w.category}</span>
                <StatusBadge status={w.status} />
              </div>
              <h3 className="font-semibold text-dark-800 dark:text-white mb-2">{w.title}</h3>
              <p className="text-xs text-dark-400 line-clamp-2 mb-4">{w.description}</p>
              <div className="space-y-2 text-xs text-dark-500">
                <div className="flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5" /> {w.ward}</div>
                <div className="flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5" /> Budget: ₹{(w.budget || 0).toLocaleString()}</div>
                {w.expectedEndDate && <div className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> ETA: {new Date(w.expectedEndDate).toLocaleDateString('en-IN')}</div>}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-dark-400 mb-1">
                  <span>Progress</span><span>{w.completionPercentage}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-dark-700 rounded-full">
                  <div className="h-1.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" style={{ width: `${w.completionPercentage}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {pagination && <Pagination pagination={pagination} onPageChange={p => setFilters({ ...filters, page: p })} />}
    </div>
  );
};

export default PublicWorks;
