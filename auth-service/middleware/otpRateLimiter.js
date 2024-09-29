const rateLimit = require('express-rate-limit');

// Apply rate limiting to OTP requests
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message:
    'Too many OTP requests from this IP, please try again after 10 minutes',
});

module.exports = { otpRateLimiter };
