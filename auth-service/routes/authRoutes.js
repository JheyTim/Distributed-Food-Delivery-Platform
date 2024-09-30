const router = require('express').Router();
const {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  activateAccount,
  resendActivationEmail,
  sendOTP,
  verifyOTP,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  otpRateLimiter,
  loginLimiter,
} = require('../middleware/rateLimiter');

// Register route
router.post('/register', register);

// Login route
router.post('/login', loginLimiter, login);

// Send OTP (MFA) after login
router.post('/send-otp', otpRateLimiter, sendOTP);

// Verify OTP (MFA)
router.post('/verify-otp', verifyOTP);

// Activate account route (Open to all)
router.get('/activate/:token', activateAccount);

// Resend activation email route (Open to all)
router.post('/resend-activation', resendActivationEmail);

// Route to refresh the access token
router.post('/refresh-token', refreshToken);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset password
router.put('/reset-password/:token', resetPassword);

// Logout route (Protected)
router.post('/logout', auth(), logout);

module.exports = router;
