import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FiHeart, FiPlus, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CAMPAIGN_TYPES = ['blood-donation', 'medical-camp', 'food-distribution', 'scholarship', 'disaster-relief', 'welfare'];

const AdminManageCharity = () => {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'welfare',
    targetAmount: 0, beneficiary: '', urgency: 'normal',
    latitude: '', longitude: '',
  });

  const load = () => {
    api.get('/charity/campaigns?limit=50').then(r => {
      setCampaigns(r.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/charity/campaigns', {
        ...form,
        district: user.district,
        targetAmount: Number(form.targetAmount),
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
      });
      toast.success('Campaign created');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'welfare', targetAmount: 0, beneficiary: '', urgency: 'normal', latitude: '', longitude: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('manageCharity')}</h1>
          <p className="page-subtitle">{t('yourDistrict')}: <strong>{user?.district}</strong></p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <FiPlus className="w-4 h-4" /> {t('addCampaign')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">{t('campaignTitle')}</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="label">{t('description')}</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('campaignType')}</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {CAMPAIGN_TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('targetAmount')}</label>
              <input type="number" className="input" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('beneficiary')}</label>
              <input className="input" value={form.beneficiary} onChange={e => setForm({ ...form, beneficiary: e.target.value })} />
            </div>
            <div>
              <label className="label">Urgency</label>
              <select className="input" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Latitude</label>
              <input className="input" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} />
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
          {campaigns.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiHeart className="text-primary-600" />
                <h3 className="font-bold text-dark-900 dark:text-white">{c.title}</h3>
              </div>
              <p className="text-sm text-dark-500 line-clamp-2">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge badge-info">{c.type}</span>
                <span className="badge badge-primary">{c.district}</span>
                {c.urgency === 'urgent' && <span className="badge badge-danger">Urgent</span>}
              </div>
              {c.latitude && (
                <p className="text-xs text-dark-400 mt-2 flex items-center gap-1">
                  <FiMapPin /> On map
                </p>
              )}
              {c.targetAmount > 0 && (
                <p className="text-sm mt-2 text-primary-700 dark:text-primary-400">
                  ₹{c.collectedAmount?.toLocaleString('en-IN')} / ₹{c.targetAmount?.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminManageCharity;
