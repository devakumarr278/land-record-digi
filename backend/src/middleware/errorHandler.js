const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  // Multer Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(
        res,
        'File size exceeds the maximum allowed limit (10MB)',
        { code: 'FILE_TOO_LARGE', details: err.message },
        400
      );
    }
    return errorResponse(res, err.message, { code: 'UPLOAD_ERROR', details: err.code }, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(
      res,
      'Validation Error',
      { code: 'VALIDATION_ERROR', details: messages },
      400
    );
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(
      res,
      `Duplicate value entered for ${field}. Please use another value.`,
      { code: 'DUPLICATE_KEY_ERROR', details: err.keyValue },
      409
    );
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(
      res,
      `Resource not found with identifier: ${err.value}`,
      { code: 'RESOURCE_NOT_FOUND', details: err.message },
      404
    );
  }

  // Default Internal Error
  return errorResponse(
    res,
    err.message || 'Internal Server Error',
    {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : 'An unexpected error occurred.',
    },
    err.statusCode || 500
  );
};

module.exports = errorHandler;
