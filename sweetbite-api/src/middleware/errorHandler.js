const env = require('../config/env');

// 404 for any route that doesn't match — must be registered after all routes.
function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

// Final error handler — must be registered last, after all routes and
// after notFound. Any error passed to next(err) anywhere ends up here.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  // Postgres unique-violation — surface as 409 instead of a generic 500.
  // Only the email constraint gets the "already registered" wording; other
  // unique columns (e.g. a duplicate cake name) get a neutral message.
  if (err.code === '23505') {
    const isEmail = /email/i.test(err.constraint || '');
    return res.status(409).json({
      error: isEmail ? 'That email is already registered.' : 'That value already exists.',
    });
  }

  const status = err.status || 500;
  const message = status === 500 && env.nodeEnv === 'production'
    ? 'Something went wrong.'
    : err.message;

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };