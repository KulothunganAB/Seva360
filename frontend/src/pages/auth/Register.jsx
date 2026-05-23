import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { registerUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
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
    role: 'citizen',
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
    const result = await dispatch(registerUser(registrationData));
    
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const dashboards = { admin: '/admin', councillor: '/councillor', citizen: '/citizen', volunteer: '/volunteer' };
      toast.success('Registration successful! Welcome to Seva360.');
      navigate(dashboards[role] || '/citizen', { replace: true });
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };
  
  const districts = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Tiruppur', 'Vellore', 'Thoothukudi'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-white font-bold text-2xl font-poppins">S</span>
        </div>
        <h1 className="text-2xl font-bold text-white font-poppins">Join Seva360</h1>
        <p className="text-dark-400 text-sm mt-1">Create your citizen account</p>
      </div>
      
      <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-email">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-phone">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="98765XXXXX"
                  className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-role">Register As</label>
              <select
                id="reg-role"
                name="role"
                className="w-full bg-dark-800/50 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="citizen">Citizen</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-district">District</label>
              <select
                id="reg-district"
                name="district"
                className="w-full bg-dark-800/50 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.district}
                onChange={handleChange}
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-ward">Ward</label>
              <input
                id="reg-ward"
                type="text"
                name="ward"
                placeholder="e.g. Ward 12"
                className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.ward}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-password">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-dark-300 mb-1.5 font-medium" htmlFor="reg-confirm">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat password"
                  className="w-full bg-dark-800/50 border border-dark-600 text-white placeholder-dark-500 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <FiUserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-dark-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium" id="login-link">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
