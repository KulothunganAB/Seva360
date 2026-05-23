import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMoon, FiSun, FiSave } from 'react-icons/fi';
import { toggleTheme } from '../../store/slices/uiSlice';
import { updateProfile } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', ward: user?.ward || '', district: user?.district || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async e => {
    e.preventDefault();
    setSaving(true);
    const result = await dispatch(updateProfile(profile));
    setSaving(false);
    if (updateProfile.fulfilled.match(result)) toast.success('Profile updated!');
    else toast.error('Failed to update profile');
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Theme */}
      <div className="card p-5">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-700 dark:text-dark-200">Dark Mode</p>
            <p className="text-xs text-dark-400">Switch between light and dark theme</p>
          </div>
          <button onClick={() => dispatch(toggleTheme())} className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}`} id="theme-toggle-settings">
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow flex items-center justify-center ${theme === 'dark' ? 'translate-x-6' : ''}`}>
              {theme === 'dark' ? <FiMoon className="w-3 h-3 text-dark-600" /> : <FiSun className="w-3 h-3 text-yellow-500" />}
            </span>
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm flex items-center gap-2"><FiUser className="w-4 h-4" /> Profile Information</h3>
        <form onSubmit={handleProfileSave} className="space-y-4" id="profile-settings-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="setting-name">Full Name</label>
              <input id="setting-name" type="text" className="input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="setting-phone">Phone</label>
              <input id="setting-phone" type="tel" className="input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="setting-ward">Ward</label>
              <input id="setting-ward" type="text" className="input" value={profile.ward} onChange={e => setProfile({ ...profile, ward: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="setting-district">District</label>
              <input id="setting-district" type="text" className="input" value={profile.district} onChange={e => setProfile({ ...profile, district: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor="setting-address">Address</label>
              <input id="setting-address" type="text" className="input" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary" id="save-profile-btn">
              <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-4 text-sm flex items-center gap-2"><FiLock className="w-4 h-4" /> Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4" id="change-password-form">
          <div>
            <label className="label" htmlFor="current-password">Current Password</label>
            <input id="current-password" type="password" className="input" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="new-password">New Password</label>
            <input id="new-password" type="password" className="input" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label" htmlFor="confirm-new-password">Confirm New Password</label>
            <input id="confirm-new-password" type="password" className="input" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" id="change-password-btn">
              <FiLock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-5">
        <h3 className="font-semibold text-dark-800 dark:text-white mb-3 text-sm">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-dark-500">Email</span><span className="text-dark-700 dark:text-dark-200">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-dark-500">Role</span><span className="capitalize text-dark-700 dark:text-dark-200">{user?.role}</span></div>
          <div className="flex justify-between"><span className="text-dark-500">Member Since</span><span className="text-dark-700 dark:text-dark-200">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
