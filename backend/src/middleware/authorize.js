const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User identity not found in request context.', { code: 'UNAUTHORIZED' }, 401);
    }

    // SYSTEM_ADMIN has superuser access to all routes
    if (req.user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        {
          code: 'FORBIDDEN',
          details: `Required role(s): [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`,
        },
        403
      );
    }

    next();
  };
};

module.exports = authorize;
