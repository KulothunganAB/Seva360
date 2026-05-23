import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUserX, FiUserCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { StatusBadge, Pagination, EmptyState, Avatar } from '../../components/ui';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['', 'citizen', 'volunteer', 'councillor', 'admin'];

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', page: 1, limit: 10 });
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const params = { ...filters };
    if (search) params.q = search;
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    try {
      const { data } = await api.get(`/admin/users?${new URLSearchParams(params)}`);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [filters, search]);

  const toggleSuspend = async (userId, isSuspended) => {
    try {
      await api.put(`/admin/users/${userId}`, { isSuspended: !isSuspended });
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended');
      loadUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      toast.success('Role updated');
      loadUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const roleColors = { admin: 'badge-primary', councillor: 'badge-info', citizen: 'badge-success', volunteer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage all platform users, roles, and access</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input className="input pl-9 text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} id="users-search" />
        </div>
        <select className="input w-36 text-sm" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })} id="filter-role">
          {ROLES.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}
        </select>
        <select className="input w-36 text-sm" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })} id="filter-user-status">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>District</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-10 skeleton rounded" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No users found" /></td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="font-medium text-dark-800 dark:text-dark-100 text-sm">{u.name}</p>
                        <p className="text-xs text-dark-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-dark-600 dark:text-dark-300">{u.phone || '—'}</td>
                  <td>
                    <select
                      className={`badge border-0 ${roleColors[u.role] || 'badge-gray'} cursor-pointer`}
                      value={u.role}
                      onChange={e => updateRole(u.id, e.target.value)}
                    >
                      {['citizen', 'volunteer', 'councillor', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="text-sm text-dark-500">{u.district || '—'}</td>
                  <td>
                    <span className={`badge ${u.isSuspended ? 'badge-danger' : 'badge-success'}`}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="text-xs text-dark-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button
                      onClick={() => toggleSuspend(u.id, u.isSuspended)}
                      className={`btn btn-sm btn-ghost ${u.isSuspended ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                      id={`toggle-suspend-${u.id}`}
                      title={u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    >
                      {u.isSuspended ? <FiUserCheck className="w-4 h-4" /> : <FiUserX className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && <div className="px-6"><Pagination pagination={pagination} onPageChange={p => setFilters({ ...filters, page: p })} /></div>}
      </div>
    </div>
  );
};

export default UsersManagement;
