const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
