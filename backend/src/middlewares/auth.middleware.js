const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const userRepository = require('../repositories/user.repository');

// Middleware utama untuk autentikasi user berbasis JWT
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authentication required');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 401, 'Invalid or expired token');
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Authentication failed');
  }
};

// Middleware tambahan untuk membatasi hanya admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Forbidden: Admin only');
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
};

