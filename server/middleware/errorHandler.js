const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message).join(', ');
    error = new AppError(msg, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token', 401);
  if (err.name === 'TokenExpiredError') error = new AppError('Token expired', 401);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
