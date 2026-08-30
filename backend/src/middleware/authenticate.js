const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication token missing. Please log in.', { code: 'UNAUTHORIZED' }, 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded._id || decoded.id);

    if (!user) {
      return errorResponse(res, 'User associated with token no longer exists.', { code: 'USER_NOT_FOUND' }, 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account is deactivated.', { code: 'ACCOUNT_DEACTIVATED' }, 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', { code: 'TOKEN_EXPIRED' }, 401);
    }
    return errorResponse(res, 'Invalid or corrupted authentication token.', { code: 'INVALID_TOKEN', details: error.message }, 401);
  }
};

module.exports = authenticate;
