// Runs db/seed.sql directly through the pg driver — see migrate.js for why
// this replaced the old psql-based npm script.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ override: false });

const sqlPath = path.join(__dirname, '..', 'db', 'seed.sql');

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const sslEnabled = process.env.DATABASE_SSL === 'true';
  const hostMatch = /@([^/]+)\//.exec(process.env.DATABASE_URL);
  console.log(`Connecting to ${hostMatch ? hostMatch[1] : '(unknown host)'} (SSL: ${sslEnabled})...`);

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Running db/seed.sql...');
    await pool.query(sql);
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();