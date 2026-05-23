import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { loginUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@seva360.in', password: 'admin123', color: 'bg-purple-600' },
  { role: 'Councillor', email: 'councillor@seva360.in', password: 'password123', color: 'bg-blue-600' },
  { role: 'Citizen', email: 'citizen@seva360.in', password: 'password123', color: 'bg-green-600' },
  { role: 'Volunteer', email: 'volunteer@seva360.in', password: 'password123', color: 'bg-orange-500' },
];

const Login = () => {
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
      const dashboards = { admin: '/admin', councillor: '/councillor', citizen: '/citizen', volunteer: '/volunteer' };
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      navigate(from || dashboards[role] || '/citizen', { replace: true });
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };
  
  const handleDemoLogin = (cred) => {
    setFormData({ email: cred.email, password: cred.password });
    toast(`Filling ${cred.role} credentials...`, { icon: '🎭' });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-900/30">
          <span className="text-white font-bold text-3xl font-poppins">S</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-poppins">Seva360</h1>
        <p className="text-dark-400 text-sm mt-1">Smart Governance • Public Service</p>
      </div>
      
      <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>
        
        {/* Demo credentials */}
        <div className="mb-6">
          <p className="text-xs text-dark-400 mb-2 uppercase tracking-wider font-medium">Quick Demo Login:</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map(cred => (
              <button
                key={cred.role}
                type="button"
                onClick={() => handleDemoLogin(cred)}
                className={`${cred.color} text-white text-xs font-medium px-3 py-2 rounded-lg hover:opacity-80 transition-all active:scale-95`}
                id={`demo-${cred.role.toLowerCase()}`}
              >
                {cred.role}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700" />
          </div>
          <div className="relative text-center">
            <span className="px-3 text-xs text-dark-500 bg-transparent">or sign in manually</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          <div>
            <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                id="email"
                type="email"
                className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                id="toggle-password"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-dark-600 bg-dark-800" />
              <span className="text-sm text-dark-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors" id="forgot-password-link">
              Forgot password?
            </Link>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-900/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-dark-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors" id="register-link">
            Register here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
