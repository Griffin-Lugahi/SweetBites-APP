const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', env.trustProxy);

app.use(helmet());
app.use(express.json({ limit: '50kb' }));
// In production, if CORS_ORIGINS is missing, fall back to your own site only
// instead of allowing every website.
const allowedOrigins =
  env.corsOrigins.length > 0
    ? env.corsOrigins
    : env.nodeEnv === 'production'
      ? ['https://griffin-lugahi.github.io']
      : true;

app.use(cors({ origin: allowedOrigins }));

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

const limiter = (windowMs, max, message = 'Too many requests. Please try again later.') =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error: message } });

const MIN15 = 15 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

app.use('/api', limiter(MIN15, 300));
app.use('/api/auth/login', limiter(MIN15, 10, 'Too many login attempts. Try again in 15 minutes.'));
app.use('/api/auth/register', limiter(HOUR, 10));
app.post('/api/contact', limiter(HOUR, 10));
// The tracking window re-checks every 8 seconds, so this allows plenty of room.
app.get('/api/orders/:orderNumber', limiter(MIN15, 300));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;