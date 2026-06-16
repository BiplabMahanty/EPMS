const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

app.use(errorHandler);

module.exports = app;
