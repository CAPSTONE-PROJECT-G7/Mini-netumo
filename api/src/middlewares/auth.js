// JWT auth middleware
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Missing token' });

 
try {
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  return next();
} catch (err) {
  console.error('JWT error:', err.message);
  return res.status(401).json({ error: 'Invalid token' });
}

};