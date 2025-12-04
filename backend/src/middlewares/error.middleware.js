const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error Stack:', err.stack);

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return errorResponse(res, 503, 'Database connection failed. Please check your database configuration.');
  }

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return errorResponse(res, 503, 'Database access denied. Please check your database credentials.');
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    return errorResponse(res, 503, 'Database does not exist. Please create the database first.');
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    return errorResponse(res, 503, 'Database table does not exist. Please import database.sql first.');
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 409, 'Duplicate entry', { field: err.sqlMessage });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return errorResponse(res, 404, 'Referenced resource not found');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, 'Validation error', err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired');
  }

  // Default error - show more details in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  return errorResponse(
    res,
    err.statusCode || 500,
    isDevelopment ? (err.message || 'Internal server error') : 'Internal server error',
    isDevelopment ? { stack: err.stack, code: err.code } : null
  );
};

module.exports = {
  errorHandler,
};

