/**
 * Standardized API response format helper
 */
const successResponse = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'An error occurred', error = {}, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      details: error.details || (typeof error === 'string' ? error : error.message || error),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
