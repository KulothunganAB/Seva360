import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiAward } from 'react-icons/fi';
import { StatusBadge, EmptyState } from '../../components/ui';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const { user } = useSelector(state => state.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.get(`/events?${new URLSearchParams(params)}`).then(r => {
      setEvents(r.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [statusFilter]);

  const registerForEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      toast.success('Registered for event!');
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, participants: [...e.participants, user?.id] } : e));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    }
  };

  const typeColors = { cleanup: 'from-green-500 to-green-700', 'medical-camp': 'from-blue-500 to-blue-700', environment: 'from-emerald-500 to-emerald-700', general: 'from-purple-500 to-purple-700' };
  const typeEmojis = { cleanup: '🧹', 'medical-camp': '🏥', environment: '🌳', general: '📅' };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <h1 className="page-title">Events</h1>
        <p className="page-subtitle">Discover and join community events near you</p>
      </div>

      <div className="flex gap-2">
        {['', 'upcoming', 'completed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm capitalize ${statusFilter === s ? 'btn-primary' : 'btn-ghost border border-gray-200 dark:border-dark-600'}`} id={`filter-event-${s || 'all'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No events found" description="No events match your filter." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {events.map((e, i) => {
            const isRegistered = e.participants?.includes(user?.id);
            const isFull = e.participants?.length >= e.maxParticipants;
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                <div className={`bg-gradient-to-r ${typeColors[e.eventType] || typeColors.general} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{typeEmojis[e.eventType] || '📅'}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <h3 className="font-bold mt-2 text-lg leading-tight">{e.title}</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-dark-400 mb-3 line-clamp-2">{e.description}</p>
                  <div className="space-y-2 text-xs text-dark-500 mb-4">
                    <div className="flex items-center gap-2"><FiCalendar className="w-3.5 h-3.5" /> {new Date(e.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="flex items-center gap-2"><FiMapPin className="w-3.5 h-3.5" /> {e.location}</div>
                    <div className="flex items-center gap-2"><FiUsers className="w-3.5 h-3.5" /> {e.participants?.length || 0} / {e.maxParticipants} registered</div>
                    {e.district && <div className="flex items-center gap-2"><FiMapPin className="w-3.5 h-3.5" /> {e.district}</div>}
                  </div>
                  {e.status === 'upcoming' && (
                    isRegistered ? (
                      <span className="badge badge-success w-full justify-center py-1.5">✓ Registered</span>
                    ) : isFull ? (
                      <span className="badge badge-danger w-full justify-center py-1.5">Event Full</span>
                    ) : (
                      <button onClick={() => registerForEvent(e.id)} className="btn btn-primary w-full" id={`join-event-${e.id}`}>
                        Register for Event
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
