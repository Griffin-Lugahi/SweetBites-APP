// Date helpers for delivery dates. Nairobi is always UTC+3 (no daylight
// saving), but we use the IANA zone name so the intent is explicit and the
// server's own timezone (Render runs in UTC) never matters.
const NAIROBI_TZ = 'Africa/Nairobi';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: NAIROBI_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Today's calendar date in Nairobi as 'YYYY-MM-DD'.
function nairobiToday() {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Nairobi's calendar date `days` from now, as 'YYYY-MM-DD'.
// Plain 'YYYY-MM-DD' strings sort correctly, so callers can compare them
// with < and > directly.
function nairobiDatePlusDays(days = 0) {
  const d = new Date(`${nairobiToday()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// True only for a real calendar date written exactly as YYYY-MM-DD
// (rejects timestamps like '2026-10-01T10:00:00Z' and dates like '2027-02-30').
function isRealCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

module.exports = { nairobiDatePlusDays, isRealCalendarDate };