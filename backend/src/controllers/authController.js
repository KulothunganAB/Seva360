const bcrypt = require('bcryptjs');
const { usersDb } = require('../database/db');
const { create, getOneBy, getAll } = require('../utils/crud');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const response = require('../utils/response');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'citizen', ward, district, address } = req.body;
    
    if (!name || !email || !password) {
      return response.badRequest(res, 'Name, email, and password are required');
    }
    
    // Check if email exists
    const existing = getOneBy(usersDb, 'users', { email: email.toLowerCase() });
    if (existing) {
      return response.conflict(res, 'Email is already registered');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Prevent self-assigning admin role
    const safeRole = ['citizen', 'volunteer'].includes(role) ? role : 'citizen';
    
    const user = create(usersDb, 'users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: safeRole,
      ward: ward || '',
      district: district || 'Chennai',
      address: address || '',
      isActive: true,
      isSuspended: false,
      avatar: '',
      volunteerPoints: 0,
      membershipQR: '',
      lastLogin: null,
    });
    
    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    
    return response.created(res, { user: userWithoutPassword, ...tokens }, 'Registration successful');
  } catch (err) {
    console.error('Register error:', err);
    return response.error(res, 'Registration failed');
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return response.badRequest(res, 'Email and password are required');
    }
    
    const user = getOneBy(usersDb, 'users', { email: email.toLowerCase() });
    if (!user) {
      return response.unauthorized(res, 'Invalid credentials');
    }
    
    if (user.isSuspended) {
      return response.forbidden(res, 'Your account has been suspended. Contact admin.');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.unauthorized(res, 'Invalid credentials');
    }
    
    // Update last login
    usersDb.get('users').find({ id: user.id }).assign({ lastLogin: new Date().toISOString() }).write();
    
    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    
    return response.success(res, { user: userWithoutPassword, ...tokens }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return response.error(res, 'Login failed');
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return response.badRequest(res, 'Refresh token is required');
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const user = getOneBy(usersDb, 'users', { id: decoded.id });
    
    if (!user || user.isSuspended) {
      return response.unauthorized(res, 'Invalid refresh token');
    }
    
    const tokens = generateTokens(user);
    return response.success(res, tokens, 'Token refreshed');
  } catch (err) {
    return response.unauthorized(res, 'Invalid or expired refresh token');
  }
};

/**
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  try {
    const user = getOneBy(usersDb, 'users', { id: req.user.id });
    if (!user) {
      return response.notFound(res, 'User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return response.success(res, userWithoutPassword);
  } catch (err) {
    return response.error(res, 'Failed to get user');
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, ward, district } = req.body;
    const userId = req.user.id;
    
    const user = getOneBy(usersDb, 'users', { id: userId });
    if (!user) return response.notFound(res);
    
    usersDb.get('users').find({ id: userId }).assign({
      name: name || user.name,
      phone: phone || user.phone,
      address: address || user.address,
      ward: ward || user.ward,
      district: district || user.district,
      updatedAt: new Date().toISOString(),
    }).write();
    
    const updated = getOneBy(usersDb, 'users', { id: userId });
    const { password: _, ...userWithoutPassword } = updated;
    return response.success(res, userWithoutPassword, 'Profile updated');
  } catch (err) {
    return response.error(res, 'Failed to update profile');
  }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return response.badRequest(res, 'Current and new password are required');
    }
    
    const user = getOneBy(usersDb, 'users', { id: userId });
    if (!user) return response.notFound(res);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return response.badRequest(res, 'Current password is incorrect');
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    usersDb.get('users').find({ id: userId }).assign({ password: hashedPassword, updatedAt: new Date().toISOString() }).write();
    
    return response.success(res, null, 'Password changed successfully');
  } catch (err) {
    return response.error(res, 'Failed to change password');
  }
};

module.exports = { register, login, refreshToken, getMe, updateProfile, changePassword };
