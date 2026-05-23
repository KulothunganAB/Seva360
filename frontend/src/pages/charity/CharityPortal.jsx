import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiDollarSign, FiUsers, FiCalendar } from 'react-icons/fi';
import { StatusBadge, EmptyState, Pagination } from '../../components/ui';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const TYPES = ['', 'blood-donation', 'medical-camp', 'food-distribution', 'scholarship', 'disaster-relief', 'welfare'];
const typeEmojis = { 'blood-donation': '🩸', 'medical-camp': '🏥', 'food-distribution': '🍱', scholarship: '🎓', 'disaster-relief': '🆘', welfare: '🤝' };

const CharityPortal = () => {
  const { user } = useSelector(state => state.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [donating, setDonating] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = { page, limit: 9 };
    if (typeFilter) params.type = typeFilter;
    api.get(`/charity/campaigns?${new URLSearchParams(params)}`).then(r => {
      setCampaigns(r.data.data || []);
      setPagination(r.data.pagination);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [typeFilter, page]);

  const handleDonate = async (campaignId) => {
    if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await api.post('/charity/donations', { campaignId, amount: Number(donationAmount), paymentMethod: 'online' });
      toast.success(`Donation of ₹${donationAmount} recorded!`);
      setDonating(null);
      setDonationAmount('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Donation failed');
    }
  };

  const handleParticipate = async (campaignId) => {
    try {
      await api.post(`/charity/campaigns/${campaignId}/participate`);
      toast.success('Joined campaign!');
      setCampaigns(prev => prev.map(c => c.id === campaignId
        ? { ...c, participants: [...c.participants, { userId: user?.id, name: user?.name }] }
        : c
      ));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="page-header">
        <h1 className="page-title">Charity & Welfare</h1>
        <p className="page-subtitle">Support community campaigns, donate, and volunteer</p>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} className={`btn btn-sm capitalize ${typeFilter === t ? 'btn-primary' : 'btn-ghost border border-gray-200 dark:border-dark-600'}`} id={`filter-charity-${t || 'all'}`}>
            {t ? `${typeEmojis[t] || ''} ${t.replace('-', ' ')}` : 'All Campaigns'}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />)}</div>
      ) : campaigns.length === 0 ? (
        <EmptyState icon={FiHeart} title="No campaigns found" description="No campaigns match your filter." />
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {campaigns.map((c, i) => {
            const progress = c.targetAmount > 0 ? Math.min((c.collectedAmount / c.targetAmount) * 100, 100) : null;
            const isParticipating = c.participants?.some(p => p.userId === user?.id);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-hover p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{typeEmojis[c.type] || '🤝'}</span>
                  <div className="flex gap-1">
                    {c.urgency === 'urgent' && <span className="badge badge-danger animate-pulse">Urgent</span>}
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <h3 className="font-semibold text-dark-800 dark:text-white mb-2">{c.title}</h3>
                <p className="text-xs text-dark-400 line-clamp-2 mb-4 flex-1">{c.description}</p>

                {progress !== null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-dark-400 mb-1">
                      <span>₹{(c.collectedAmount || 0).toLocaleString()} raised</span>
                      <span>of ₹{(c.targetAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-dark-700 rounded-full">
                      <div className="h-2 bg-gradient-to-r from-primary-600 to-gold-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-dark-400 mt-1">{Math.round(progress)}% funded • {c.donors?.length || 0} donors</p>
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  {/* Donate button */}
                  {c.targetAmount > 0 && c.status === 'active' && (
                    donating === c.id ? (
                      <div className="flex gap-2 flex-1">
                        <input type="number" placeholder="Amount ₹" className="input text-sm flex-1 py-1.5 h-9" value={donationAmount} onChange={e => setDonationAmount(e.target.value)} autoFocus id={`donation-input-${c.id}`} />
                        <button onClick={() => handleDonate(c.id)} className="btn btn-primary btn-sm" id={`confirm-donate-${c.id}`}>Pay</button>
                        <button onClick={() => setDonating(null)} className="btn btn-ghost btn-sm">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setDonating(c.id)} className="btn btn-primary btn-sm flex-1" id={`donate-btn-${c.id}`}>
                        <FiDollarSign className="w-3.5 h-3.5" /> Donate
                      </button>
                    )
                  )}
                  {/* Participate */}
                  {!isParticipating ? (
                    <button onClick={() => handleParticipate(c.id)} className="btn btn-outline btn-sm flex-1" id={`participate-btn-${c.id}`}>
                      <FiUsers className="w-3.5 h-3.5" /> Join
                    </button>
                  ) : (
                    <span className="badge badge-success text-xs flex-1 justify-center">Joined ✓</span>
                  )}
                </div>

                <div className="mt-3 text-xs text-dark-400 flex items-center gap-3">
                  <span><FiUsers className="inline w-3 h-3 mr-0.5" />{c.participants?.length || 0} participants</span>
                  <span>{c.district}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
};

export default CharityPortal;
