const router = require('express').Router();
const {
  register,
  login,
  refreshToken,
} = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Route to refresh the access token
router.post('/refresh-token', refreshToken);

module.exports = router;
