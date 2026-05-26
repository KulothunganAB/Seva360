import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { setLanguage } from '../../i18n';
import toast from 'react-hot-toast';

const Register = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    ward: '',
    district: 'Chennai',
    address: '',
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    const { confirmPassword, ...registrationData } = formData;
    const result = await dispatch(registerUser({ ...registrationData, role: 'citizen' }));
    
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful!');
      navigate('/citizen', { replace: true });
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };
  
  const districts = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'];
  
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="px-8 pt-8 pb-5 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl font-poppins">S</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white font-poppins">{t('joinSeva360')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('citizenAccount')}</p>
        </div>

        <div className="px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label" htmlFor="reg-name">{t('fullName')}</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="input pl-10"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="label" htmlFor="reg-email">{t('email')}</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="input pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="label" htmlFor="reg-phone">{t('phone')}</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="98765XXXXX"
                  className="input pl-10"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="label" htmlFor="reg-district">{t('district')}</label>
              <select
                id="reg-district"
                name="district"
                className="input"
                value={formData.district}
                onChange={handleChange}
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div>
              <label className="label" htmlFor="reg-ward">{t('ward')}</label>
              <input
                id="reg-ward"
                type="text"
                name="ward"
                placeholder="e.g. Ward 12"
                className="input"
                value={formData.ward}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="label" htmlFor="reg-password">{t('password')}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  className="input pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="label" htmlFor="reg-confirm">Confirm {t('password')}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat password"
                  className="input pl-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <button type="submit" id="register-submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? t('loading') : (<><FiUserPlus className="w-4 h-4" />{t('createAccount')}</>)}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          {t('hasAccount')}{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold" id="login-link">
            {t('signIn')}
          </Link>
        </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
