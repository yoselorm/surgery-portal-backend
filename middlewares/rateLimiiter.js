const rateLimit = require('express-rate-limit')

exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: "Too many requests. Please try again later.",
    },
  });