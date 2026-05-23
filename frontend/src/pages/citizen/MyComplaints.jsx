import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import { fetchComplaints } from '../../store/slices/complaintsSlice';
import { StatusBadge, PriorityBadge, EmptyState, Skeleton } from '../../components/ui';

const MyComplaints = () => {
  const dispatch = useDispatch();
  const { complaints, loading } = useSelector(state => state.complaints);

  useEffect(() => { dispatch(fetchComplaints({ limit: 20 })); }, []);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">Track the status of all your filed grievances</p>
        </div>
        <Link to="/citizen/new-complaint" className="btn btn-primary btn-sm" id="new-complaint-btn">
          <FiPlus /> File New
        </Link>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : complaints.length === 0 ? (
          <EmptyState icon={FiAlertCircle} title="No complaints yet" description="File your first complaint and track it in real time." action={<Link to="/citizen/new-complaint" className="btn btn-primary" id="file-complaint-empty">File Complaint</Link>} />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {complaints.map(c => (
              <Link key={c.id} to={`/citizen/complaints/${c.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors" id={`my-complaint-${c.id}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiAlertCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark-800 dark:text-dark-100">{c.title}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{c.ticketNumber} • {c.category} • {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                    <p className="text-xs text-dark-500 mt-1">{c.ward}</p>
                  </div>
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
    </div>
  );
};

export default MyComplaints;
