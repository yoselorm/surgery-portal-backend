const rateLimit = require('express-rate-limit');



const violationStore = new Map(); 

const VIOLATION_WINDOW_MS = 60 * 60 * 1000;  // violations older than 1hr don't count
const BAN_THRESHOLD = 3;                     // hit a rate limit 3x within the window -> ban
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24hr ban

function getRecord(ip) {
  return violationStore.get(ip) || { violations: 0, firstViolationAt: null, bannedUntil: null };
}

function registerViolation(ip) {
  const now = Date.now();
  const record = getRecord(ip);

  if (record.firstViolationAt && now - record.firstViolationAt > VIOLATION_WINDOW_MS) {
    record.violations = 0;
    record.firstViolationAt = null;
  }

  record.violations += 1;
  if (!record.firstViolationAt) record.firstViolationAt = now;

  if (record.violations >= BAN_THRESHOLD) {
    record.bannedUntil = now + BAN_DURATION_MS;
  }

  violationStore.set(ip, record);
  return record;
}

function isBanned(ip) {
  const record = violationStore.get(ip);
  if (!record || !record.bannedUntil) return false;

  if (Date.now() > record.bannedUntil) {
    violationStore.delete(ip);
    return false;
  }
  return true;
}


exports.blacklistMiddleware = (req, res, next) => {
  const ip = req.ip;

  if (isBanned(ip)) {
    const record = violationStore.get(ip);
    const retryAfterSeconds = Math.ceil((record.bannedUntil - Date.now()) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(403).json({
      message: 'Your IP has been temporarily blocked due to repeated rate limit violations.',
      retryAfterSeconds,
    });
  }

  next();
};



function violationHandler(message) {
  return (req, res) => {
    const record = registerViolation(req.ip);

    if (record.bannedUntil) {
      const retryAfterSeconds = Math.ceil((record.bannedUntil - Date.now()) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(403).json({
        message: 'Your IP has been temporarily blocked due to repeated rate limit violations.',
        retryAfterSeconds,
      });
    }

    return res.status(429).json({ message });
  };
}

/**
 * ── General API limiter ──────────────────────────────────────────────
 * Applies to most routes.
 */
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: violationHandler('Too many requests. Please try again later.'),
});



exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: violationHandler('Too many login attempts. Please try again later.'),
});

/**
 * ── Refresh-token limiter ─────────────────────────────────────────────
 * Now that refresh happens automatically from the axios interceptor
 * (see api.js) rather than a cookie the browser silently attaches, it's
 * worth its own limiter: generous enough that normal 401-triggered
 * refreshes never get caught, but tight enough to stop someone hammering
 * the endpoint with a stolen or guessed refresh token.
 */
exports.refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: violationHandler('Too many refresh attempts. Please log in again.'),
});

/**
 * ── Manual controls (wire these up to an admin route) ────────────────
 */
exports.blockIp = (ip, durationMs = BAN_DURATION_MS) => {
  violationStore.set(ip, {
    violations: BAN_THRESHOLD,
    firstViolationAt: Date.now(),
    bannedUntil: Date.now() + durationMs,
  });
};

exports.unblockIp = (ip) => {
  violationStore.delete(ip);
};

exports.getBannedIps = () => {
  const now = Date.now();
  return Array.from(violationStore.entries())
    .filter(([, record]) => record.bannedUntil && record.bannedUntil > now)
    .map(([ip, record]) => ({ ip, bannedUntil: record.bannedUntil }));
};

