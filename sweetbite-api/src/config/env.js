require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Fail fast and loudly on boot rather than throwing a confusing error
  // the first time someone logs in.
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill these in.');
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

// Render / Railway put a load balancer in front of the app. Without "trust
// proxy", Express sees the load balancer's IP for EVERY visitor, so all
// rate limits are shared by everyone (a few failed logins could lock out
// all customers). In production we default to trusting one proxy hop; set
// TRUST_PROXY to override (a number of hops, "true", "false", or a subnet).
function parseTrustProxy(value) {
  if (value === undefined || value === '') return nodeEnv === 'production' ? 1 : false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  const hops = parseInt(value, 10);
  return Number.isNaN(hops) ? value : hops;
}

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Warnings only (not hard failures) so a deploy never goes down over config
// that used to work — but they're loud in the logs.
if (nodeEnv === 'production') {
  const secret = process.env.JWT_SECRET;
  if (secret.length < 32 || /replace-this|changeme|secret$/i.test(secret)) {
    console.warn('[SECURITY] JWT_SECRET looks weak or is still the example value. Anyone who knows it can forge admin logins. Generate a new one: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  }
  if (corsOrigins.length === 0) {
    console.warn('[SECURITY] CORS_ORIGIN is not set, so ANY website can call this API from a browser. Set it to your site origin, e.g. https://griffin-lugahi.github.io (origin only, no path).');
  }
}

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv,
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === 'true',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins,
};