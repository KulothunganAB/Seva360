import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMessageSquare, FiSend } from 'react-icons/fi';
import { fetchComplaintById, addComplaintComment } from '../../store/slices/complaintsSlice';
import { StatusBadge, PriorityBadge } from '../../components/ui';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ComplaintDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentComplaint: c, loading } = useSelector(state => state.complaints);
  const { user } = useSelector(state => state.auth);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { dispatch(fetchComplaintById(id)); }, [id]);

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    const result = await dispatch(addComplaintComment({ id, text: comment }));
    setSending(false);
    if (addComplaintComment.fulfilled.match(result)) { setComment(''); toast.success('Comment added'); }
    else toast.error('Failed to add comment');
  };

  if (loading || !c) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
    </div>
  );

  const statusColors = { open: 'bg-yellow-500', 'in-progress': 'bg-blue-500', resolved: 'bg-green-500', closed: 'bg-gray-500', rejected: 'bg-red-500' };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" id="back-btn">
        <FiArrowLeft /> Back
      </button>

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">{c.ticketNumber}</span>
              <span className="badge badge-gray capitalize">{c.category}</span>
              <PriorityBadge priority={c.priority} />
            </div>
            <h1 className="text-xl font-bold text-dark-900 dark:text-white">{c.title}</h1>
            <p className="text-sm text-dark-500 mt-1">Submitted by {c.citizenName} • {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
          <StatusBadge status={c.status} className="text-sm px-3 py-1" />
        </div>
        <p className="text-dark-600 dark:text-dark-300 text-sm leading-relaxed mb-4">{c.description}</p>
        {c.ward && <p className="text-xs text-dark-400"><span className="font-medium">📍 Location:</span> {c.ward}{c.address ? `, ${c.address}` : ''}</p>}
        {c.assignedTo && <p className="text-xs text-dark-400 mt-1"><span className="font-medium">👤 Assigned to:</span> {c.assignedTo}</p>}
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">Status Timeline</h3>
        <div className="space-y-0">
          {(c.timeline || []).map((t, i) => (
            <div key={t.id} className="timeline-item">
              <div className={`timeline-dot ${statusColors[t.status] || 'bg-gray-400'}`}>
                <span className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-medium text-dark-800 dark:text-dark-100">{t.message}</p>
                <p className="text-xs text-dark-400 mt-0.5">by {t.by} • {new Date(t.timestamp).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="card p-6">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4" /> Comments ({c.comments?.length || 0})
        </h3>
        <div className="space-y-4 mb-5">
          {(c.comments || []).length === 0 ? (
            <p className="text-sm text-dark-400 text-center py-4">No comments yet</p>
          ) : c.comments.map(cm => (
            <div key={cm.id} className={`flex gap-3 ${cm.authorId === user?.id ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                {cm.authorName?.charAt(0)}
              </div>
              <div className={`max-w-xs ${cm.authorId === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-xl text-sm ${cm.authorId === user?.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-700 text-dark-700 dark:text-dark-200'}`}>
                  {cm.text}
                </div>
                <p className="text-xs text-dark-400 mt-1">{cm.authorName} ({cm.authorRole}) • {new Date(cm.timestamp).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleComment} className="flex gap-3" id="comment-form">
          <input value={comment} onChange={e => setComment(e.target.value)} className="input flex-1" placeholder="Add a comment..." id="comment-input" />
          <button type="submit" disabled={sending || !comment.trim()} className="btn btn-primary flex-shrink-0" id="send-comment">
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintDetail;
