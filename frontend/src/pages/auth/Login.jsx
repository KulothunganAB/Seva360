import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { setLanguage } from '../../i18n';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = [
  { roleKey: 'admin', district: 'Chennai', email: 'admin.chennai@seva360.in', password: 'admin123' },
  { roleKey: 'admin', district: 'Coimbatore', email: 'admin.coimbatore@seva360.in', password: 'admin123' },
  { roleKey: 'citizen', district: 'Chennai', email: 'citizen.chennai@seva360.in', password: 'password123' },
  { roleKey: 'citizen', district: 'Madurai', email: 'citizen.madurai@seva360.in', password: 'password123' },
];

const Login = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const dashboards = { admin: '/admin', citizen: '/citizen' };
      toast.success(`${t('welcomeBack')}, ${result.payload.user.name}!`);
      navigate(from || dashboards[role] || '/citizen', { replace: true });
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  const handleDemoLogin = (cred) => {
    setFormData({ email: cred.email, password: cred.password });
    toast(`${cred.district} ${t(cred.roleKey)}`, { icon: '✓' });
  };

  const toggleLang = () => setLanguage(i18n.language === 'ta' ? 'en' : 'ta');

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl font-poppins">S</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white font-poppins">{t('appName')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('tagline')}</p>
        </div>

        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('signIn')}</h2>
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              id="lang-toggle"
            >
              {i18n.language === 'ta' ? t('english') : t('tamil')}
            </button>
          </div>

          <div className="mb-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">{t('quickDemo')}</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map(cred => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleDemoLogin(cred)}
                  className="text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:border-primary-300 hover:text-primary-700 dark:hover:border-primary-700 dark:hover:text-primary-400 transition-colors text-left"
                >
                  <span className="block text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{t(cred.roleKey)}</span>
                  {cred.district}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative text-center">
              <span className="px-2 text-xs text-slate-400 bg-white dark:bg-slate-900">{t('orManual')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="label" htmlFor="email">{t('email')}</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="email@seva360.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">{t('password')}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                {t('rememberMe')}
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                {t('forgotPassword')}
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? t('loading') : (<><FiLogIn className="w-4 h-4" />{t('signIn')}</>)}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
