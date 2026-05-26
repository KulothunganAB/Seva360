import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FiCalendar, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['general', 'cleanup', 'medical-camp', 'environment', 'welfare'];

const AdminManageEvents = () => {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '',
    eventType: 'general', maxParticipants: 100,
    latitude: '', longitude: '',
  });

  const loadEvents = () => {
    api.get('/events?limit=50').then(r => {
      setEvents(r.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', {
        ...form,
        district: user.district,
        maxParticipants: Number(form.maxParticipants),
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
      });
      toast.success('Event created');
      setShowForm(false);
      setForm({ title: '', description: '', date: '', location: '', eventType: 'general', maxParticipants: 100, latitude: '', longitude: '' });
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      loadEvents();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between page-header mb-0">
        <div>
          <h1 className="page-title">{t('manageEvents')}</h1>
          <p className="page-subtitle">{t('yourDistrict')}: <strong>{user?.district}</strong></p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <FiPlus className="w-4 h-4" /> {t('addEvent')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('eventTitle')}</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('eventDate')}</label>
              <input type="datetime-local" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('location')}</label>
              <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('description')}</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}>
                {EVENT_TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Max participants</label>
              <input type="number" className="input" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} />
            </div>
            <div>
              <label className="label">Latitude (map)</label>
              <input className="input" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="13.0827" />
            </div>
            <div>
              <label className="label">Longitude (map)</label>
              <input className="input" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="80.2707" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">{t('save')}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="skeleton h-32 rounded-xl" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map(e => (
            <div key={e.id} className="card p-5">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-dark-900 dark:text-white">{e.title}</h3>
                <button type="button" onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-600 p-1">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-dark-500 mt-2 line-clamp-2">{e.description}</p>
              <div className="mt-3 space-y-1 text-xs text-dark-500">
                <div className="flex items-center gap-2"><FiCalendar /> {new Date(e.date).toLocaleString('en-IN')}</div>
                <div className="flex items-center gap-2"><FiMapPin /> {e.location}</div>
                <span className="badge badge-info">{e.district}</span>
                <span className="badge badge-gray ml-1">{e.participants?.length || 0} registered</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminManageEvents;
