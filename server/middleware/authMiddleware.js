import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authentication verification middleware
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Try reading from Authorization Header (Bearer token) first
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Fallback to HTTP-only cookies if Bearer header is missing or 'none'
    if ((!token || token === 'none' || token === 'null') && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token || token === 'none' || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'goa_tournament_super_secret_jwt_key_2026_mca_project'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session no longer exists. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'SPECTATOR'}' does not have access to this resource.`,
      });
    }
    next();
  };
};

// Aliases for compatibility
export const verifyAuth = protect;
export const authorizeRoles = authorize;

export default {
  protect,
  verifyAuth,
  authorize,
  authorizeRoles,
};
