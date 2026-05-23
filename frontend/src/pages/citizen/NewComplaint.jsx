import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import { createComplaint } from '../../store/slices/complaintsSlice';
import toast from 'react-hot-toast';

const CATEGORIES = ['water', 'roads', 'electricity', 'sanitation', 'welfare', 'public-safety', 'corruption', 'others'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const NewComplaint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.complaints);

  const [form, setForm] = useState({
    title: '', description: '', category: 'roads', priority: 'medium',
    ward: user?.ward || '', address: user?.address || '',
    latitude: '', longitude: '',
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error('Please fill all required fields');
      return;
    }
    const result = await dispatch(createComplaint(form));
    if (createComplaint.fulfilled.match(result)) {
      toast.success(`Complaint filed! Ticket: ${result.payload.ticketNumber}`);
      navigate('/citizen/complaints');
    } else {
      toast.error('Failed to submit complaint');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setForm({ ...form, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        toast.success('Location captured!');
      }, () => toast.error('Location access denied'));
    }
  };

  const categoryIcons = { water: '💧', roads: '🛣️', electricity: '⚡', sanitation: '🗑️', welfare: '🤝', 'public-safety': '🛡️', corruption: '⚠️', others: '📋' };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">File a Complaint</h1>
        <p className="page-subtitle">Report civic issues in your area. We'll ensure it reaches the right authority.</p>
      </div>

      <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="space-y-5" id="complaint-form">
          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${form.category === cat ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700' : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 text-dark-500'}`}
                  id={`cat-${cat}`}
                >
                  <span className="text-lg">{categoryIcons[cat]}</span>
                  <span className="capitalize">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label" htmlFor="complaint-title">Title *</label>
            <input id="complaint-title" name="title" type="text" className="input" placeholder="Brief description of the issue" value={form.title} onChange={handleChange} required maxLength={100} />
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="complaint-desc">Description *</label>
            <textarea id="complaint-desc" name="description" className="input min-h-32 resize-none" placeholder="Detailed description — what happened, when, impact on residents..." value={form.description} onChange={handleChange} required rows={4} maxLength={1000} />
            <p className="text-xs text-dark-400 mt-1">{form.description.length}/1000</p>
          </div>

          {/* Priority */}
          <div>
            <label className="label">Priority Level *</label>
            <div className="flex gap-3">
              {PRIORITIES.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 capitalize transition-all ${form.priority === p
                    ? p === 'critical' ? 'bg-red-600 border-red-600 text-white'
                    : p === 'high' ? 'bg-orange-500 border-orange-500 text-white'
                    : p === 'medium' ? 'bg-yellow-500 border-yellow-500 text-white'
                    : 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-200 dark:border-dark-600 text-dark-500 hover:border-gray-300'
                  }`}
                  id={`priority-${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="complaint-ward">Ward</label>
              <input id="complaint-ward" name="ward" type="text" className="input" placeholder="e.g. Ward 12 - Adyar" value={form.ward} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="complaint-address">Address</label>
              <input id="complaint-address" name="address" type="text" className="input" placeholder="Street / area" value={form.address} onChange={handleChange} />
            </div>
          </div>

          {/* GPS */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
            <FiMapPin className="text-blue-500 w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-sm text-dark-600 dark:text-dark-300">
              {form.latitude ? `📍 Location: ${form.latitude}, ${form.longitude}` : 'Add GPS location for faster resolution'}
            </div>
            <button type="button" onClick={getLocation} className="btn btn-outline btn-sm" id="get-location-btn">
              Get Location
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1" id="submit-complaint">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewComplaint;
