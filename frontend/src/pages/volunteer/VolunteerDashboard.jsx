import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiActivity, FiAward, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { StatCard, StatusBadge } from '../../components/ui';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/volunteers/me').catch(() => ({ data: { data: null } })),
      api.get('/volunteers/events?status=upcoming&limit=5'),
      api.get('/volunteers/leaderboard'),
    ]).then(([pr, er, lr]) => {
      setProfile(pr.data.data);
      setEvents(er.data.data || []);
      setLeaderboard(lr.data.data?.slice(0, 5) || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const { data } = await api.post('/volunteers/register', { district: user?.district || 'Chennai', skills: [], availability: 'weekends' });
      setProfile(data.data);
      toast.success('Volunteer registration submitted!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    }
    setRegistering(false);
  };

  const registerForEvent = async (eventId) => {
    try {
      await api.post(`/volunteers/events/${eventId}/register`);
      toast.success('Registered for event!');
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, participants: [...e.participants, user.id] } : e));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="page-title">Volunteer Dashboard</h1>
        <p className="page-subtitle">Singapadai Volunteer Network</p>
      </div>

      {/* Not registered */}
      {!profile && !loading && (
        <div className="card p-8 text-center border-2 border-dashed border-primary-200 dark:border-primary-800">
          <FiAward className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-2">Join the Singapadai Network</h3>
          <p className="text-dark-400 text-sm mb-6">Register as a volunteer to start earning points, join events and make a difference.</p>
          <button onClick={handleRegister} disabled={registering} className="btn btn-primary btn-lg" id="register-volunteer-btn">
            {registering ? 'Registering...' : 'Register as Volunteer'}
          </button>
        </div>
      )}

      {/* Profile stats */}
      {profile && (
        <>
          <div className="card p-5 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-200 text-sm">Membership ID</p>
                <h2 className="text-2xl font-bold font-mono">{profile.membershipId}</h2>
                <StatusBadge status={profile.status} className="mt-2" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{profile.points}</div>
                <div className="text-primary-200 text-sm">Reward Points</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(profile.badges || []).map(b => (
                <span key={b} className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">🏅 {b}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Points" value={profile.points} icon={FiAward} color="gold" />
            <StatCard title="Events Attended" value={profile.eventsAttended?.length || 0} icon={FiCalendar} color="success" />
            <StatCard title="Tasks Done" value={profile.tasksCompleted?.length || 0} icon={FiCheckCircle} color="info" />
            <StatCard title="Badges" value={profile.badges?.length || 0} icon={FiActivity} color="primary" />
          </div>
        </>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card p-5">
          <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">Upcoming Events</h3>
          {events.length === 0 ? <p className="text-sm text-dark-400 text-center py-8">No upcoming events</p> : events.map(e => (
            <div key={e.id} className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-dark-700 last:border-0">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiCalendar className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark-700 dark:text-dark-200 text-sm">{e.title}</p>
                <p className="text-xs text-dark-400">{new Date(e.date).toLocaleDateString('en-IN')} • {e.location}</p>
                <p className="text-xs text-gold-500 mt-1">🎁 {e.rewards} points reward</p>
              </div>
              {!e.participants.includes(user?.id) ? (
                <button onClick={() => registerForEvent(e.id)} className="btn btn-primary btn-sm flex-shrink-0" id={`register-event-${e.id}`}>Join</button>
              ) : (
                <span className="badge badge-success text-xs">Joined ✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="card p-5">
          <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">🏆 Leaderboard</h3>
          {leaderboard.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-dark-700 last:border-0">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-gold-500 text-dark-900' : i === 1 ? 'bg-gray-300 text-dark-700' : i === 2 ? 'bg-orange-400 text-white' : 'bg-dark-200 dark:bg-dark-600 text-dark-600 dark:text-dark-300'}`}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-dark-700 dark:text-dark-200 text-sm">{v.name}</p>
                <p className="text-xs text-dark-400">{v.district}</p>
              </div>
              <span className="font-bold text-gold-500 text-sm">{v.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
