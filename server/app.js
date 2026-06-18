const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize());  // NoSQL injection prevention
app.use(xssClean());       // XSS prevention
app.use(hpp());            // HTTP param pollution

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiters
const authLimiter = new RateLimiterMemory({ points: 10, duration: 60 });
const apiLimiter = new RateLimiterMemory({ points: 200, duration: 60 });

app.use('/api/auth', async (req, res, next) => {
  try { await authLimiter.consume(req.ip); next(); }
  catch { res.status(429).json({ message: 'Too many requests' }); }
});
app.use('/api', async (req, res, next) => {
  try { await apiLimiter.consume(req.ip); next(); }
  catch { res.status(429).json({ message: 'Too many requests' }); }
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api', require('./routes/category.routes'));
app.use('/api/units', require('./routes/unit.routes'));
app.use('/api/parties', require('./routes/party.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/employee', require('./routes/employee.routes'));
app.use('/api/employees', require('./routes/employeeAdmin.routes'));

// 404 handler
app.all('*', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

app.use(errorHandler);

module.exports = app;
