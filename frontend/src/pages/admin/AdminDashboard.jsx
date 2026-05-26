import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiTool, FiUsers, FiHeart, FiCalendar, FiTrendingUp, FiActivity, FiFileText } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { StatCard, StatusBadge, PriorityBadge, Skeleton } from '../../components/ui';
import api from '../../services/api';

const COLORS = ['#B91C1C', '#1D4ED8', '#16A34A', '#F59E0B', '#7C3AED', '#EC4899'];

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => {
      setStats(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const o = stats?.overview || {};

  const complaintStatusData = stats?.complaintsByStatus ? Object.entries(stats.complaintsByStatus).map(([k, v]) => ({ name: k, value: v })) : [];
  const categoryData = stats?.complaintsByCategory ? Object.entries(stats.complaintsByCategory).map(([k, v]) => ({ name: k, count: v })) : [];
  const monthlyData = stats?.monthlyComplaints || [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Link to="/admin/reports" className="btn btn-primary btn-sm" id="view-reports-btn"><FiFileText className="w-4 h-4" /> Reports</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={loading ? '-' : o.totalUsers} icon={FiUsers} color="info" loading={loading} change="↑ 12 this month" changeType="up" />
        <StatCard title="Total Complaints" value={loading ? '-' : o.totalComplaints} icon={FiAlertCircle} color="primary" loading={loading} />
        <StatCard title="Open Complaints" value={loading ? '-' : o.openComplaints} icon={FiActivity} color="warning" loading={loading} />
        <StatCard title="Works Completed" value={loading ? '-' : o.completedWorks} icon={FiTool} color="success" loading={loading} />
        <StatCard title="Active Volunteers" value={loading ? '-' : o.totalVolunteers} icon={FiUsers} color="gold" loading={loading} />
        <StatCard title="Total Events" value={loading ? '-' : o.totalEvents} icon={FiCalendar} color="purple" loading={loading} />
        <StatCard title="Active Campaigns" value={loading ? '-' : o.totalCampaigns} icon={FiHeart} color="primary" loading={loading} />
        <StatCard title="Donations (₹)" value={loading ? '-' : `₹${(o.totalDonations || 0).toLocaleString()}`} icon={FiTrendingUp} color="success" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Complaints Line Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">Monthly Complaint Trends</h3>
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" stroke="#B91C1C" strokeWidth={2} dot={{ r: 4, fill: '#B91C1C' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaints by Status Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">Complaints by Status</h3>
          {loading ? <Skeleton className="h-48 w-full rounded-full mx-auto" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={complaintStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {complaintStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">Complaints by Category</h3>
        {loading ? <Skeleton className="h-40 w-full" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#B91C1C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800 dark:text-white text-sm">Recent Complaints</h3>
            <Link to="/admin/complaints" className="text-xs text-primary-600 hover:underline" id="view-all-complaints">View all</Link>
          </div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
            <div className="space-y-3">
              {(stats?.recentComplaints || []).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-dark-700 dark:text-dark-200 truncate max-w-xs">{c.title}</p>
                    <p className="text-xs text-dark-400">{c.ticketNumber} • {c.citizenName}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800 dark:text-white text-sm">Upcoming Events</h3>
            <Link to="/admin/events" className="text-xs text-primary-600 hover:underline">Manage</Link>
          </div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="space-y-3">
              {(stats?.upcomingEvents || []).map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-dark-700 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{e.title}</p>
                    <p className="text-xs text-dark-400">{e.district} • {new Date(e.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
