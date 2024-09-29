const router = require('express').Router();
const {
  register,
  login,
  refreshToken,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Route to refresh the access token
router.post('/refresh-token', refreshToken);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset password
router.put('/reset-password/:token', resetPassword);

module.exports = router;
