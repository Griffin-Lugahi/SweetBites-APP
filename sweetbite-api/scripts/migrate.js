// Runs db/schema.sql directly through the pg driver instead of shelling
// out to psql. This avoids two problems the old npm-script approach had:
//   1. npm scripts run through cmd.exe on Windows, which doesn't understand
//      the bash "$DATABASE_URL" syntax the old script relied on.
//   2. It required psql to be installed and on PATH, which is an extra
//      manual setup step this project doesn't otherwise need.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// override:false is dotenv's default, but we're explicit here on purpose —
// if you run this with DATABASE_URL/DATABASE_SSL already set in the shell
// (e.g. to target a different database than your local .env points at),
// those shell values must win over whatever's in .env.
require('dotenv').config({ override: false });

const sqlPath = path.join(__dirname, '..', 'db', 'schema.sql');

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const sslEnabled = process.env.DATABASE_SSL === 'true';
  // Print the host (never the password) so a connection problem is
  // immediately visible instead of a guessing game.
  const hostMatch = /@([^/]+)\//.exec(process.env.DATABASE_URL);
  console.log(`Connecting to ${hostMatch ? hostMatch[1] : '(unknown host)'} (SSL: ${sslEnabled})...`);

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Running db/schema.sql...');
    await pool.query(sql);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();