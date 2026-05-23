const { verifyAccessToken } = require('../utils/jwt');
const response = require('../utils/response');

/**
 * Authenticate JWT token middleware
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.unauthorized(res, 'No token provided');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return response.unauthorized(res, 'Token expired');
    }
    return response.unauthorized(res, 'Invalid token');
  }
};

/**
 * Authorize specific roles
 * @param {...string} roles - allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return response.unauthorized(res, 'Not authenticated');
    }
    
    if (!roles.includes(req.user.role)) {
      return response.forbidden(res, 'You do not have permission to perform this action');
    }
    
    next();
  };
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
  } catch (err) {
    // ignore errors for optional auth
  }
  
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
