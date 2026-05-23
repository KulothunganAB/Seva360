import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { fetchComplaints, updateComplaintStatus } from '../../store/slices/complaintsSlice';
import { StatusBadge, PriorityBadge, Pagination, EmptyState, Skeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUSES = ['', 'open', 'in-progress', 'resolved', 'closed', 'rejected'];
const CATEGORIES = ['', 'water', 'roads', 'electricity', 'sanitation', 'welfare', 'public-safety', 'corruption', 'others'];

const ComplaintsManagement = () => {
  const dispatch = useDispatch();
  const { complaints, loading, pagination } = useSelector(state => state.complaints);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const params = { ...filters };
    if (search) params.q = search;
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    dispatch(fetchComplaints(params));
  }, [filters, search]);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    const result = await dispatch(updateComplaintStatus({ id, status, message: `Status updated to ${status} by admin` }));
    setUpdatingId(null);
    if (updateComplaintStatus.fulfilled.match(result)) {
      toast.success('Status updated');
    } else {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <h1 className="page-title">Complaint Management</h1>
        <p className="page-subtitle">Monitor and manage all citizen grievances</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input className="input pl-9 text-sm" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} id="complaints-search" />
        </div>
        <select className="input w-36 text-sm" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })} id="filter-status">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
        <select className="input w-40 text-sm" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value, page: 1 })} id="filter-category">
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Title</th>
                <th>Citizen</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8}><Skeleton className="h-10 w-full" /></td></tr>
              )) : complaints.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={FiAlertCircle} title="No complaints found" description="No complaints match your current filters." /></td></tr>
              ) : complaints.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                  <td><span className="font-mono text-xs text-primary-600">{c.ticketNumber}</span></td>
                  <td className="max-w-xs">
                    <p className="font-medium text-dark-800 dark:text-dark-100 truncate">{c.title}</p>
                    <p className="text-xs text-dark-400">{c.ward}</p>
                  </td>
                  <td className="text-sm">{c.citizenName}</td>
                  <td><span className="capitalize text-xs badge badge-gray">{c.category}</span></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td>
                    <select
                      className="text-xs border border-gray-200 dark:border-dark-600 rounded-lg px-2 py-1 bg-transparent"
                      value={c.status}
                      onChange={e => handleStatusUpdate(c.id, e.target.value)}
                      disabled={updatingId === c.id}
                    >
                      {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="text-xs text-dark-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <Link to={`/admin/complaints/${c.id}`} className="btn btn-ghost btn-sm p-1" id={`view-complaint-${c.id}`}>
                      <FiEye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="px-6">
            <Pagination pagination={pagination} onPageChange={p => setFilters({ ...filters, page: p })} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsManagement;
