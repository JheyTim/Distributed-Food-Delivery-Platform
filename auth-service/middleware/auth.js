const jwt = require('jsonwebtoken');
const Blacklist = require('../models/Blacklist');

module.exports = function (requiredRoles = []) {
  return async function (req, res, next) {
    const token = req.header('Authorization');
    if (!token)
      return res
        .status(401)
        .json({ message: 'No token, authorization denied' });

    try {
      const tokenStr = token.split(' ')[1];

      // Check if the token is blacklisted
      const blacklisted = await Blacklist.findOne({ token: tokenStr });

      if (blacklisted) {
        return res.status(403).json({ message: 'Token has been revoked' });
      }

      const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
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
