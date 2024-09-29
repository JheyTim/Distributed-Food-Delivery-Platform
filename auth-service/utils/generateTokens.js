const jwt = require('jsonwebtoken');

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Access token valid for 15 minutes
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Refresh token valid for 7 days
  );

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
