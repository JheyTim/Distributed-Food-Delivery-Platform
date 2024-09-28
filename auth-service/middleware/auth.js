const jwt = require('jsonwebtoken');

module.exports = function (requiredRoles = []) {
  return function (req, res, next) {
    const token = req.header('Authorization');
    if (!token)
      return res
        .status(401)
        .json({ message: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
      req.user = decoded.user;

      // Check if the user's role is allowed
      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: 'Access denied: insufficient permissions' });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};
