const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

// Coordinator-only middleware
const coordinatorOnly = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'coordinator') {
    return res.status(403).json({ message: 'Coordinator access required.' });
  }
  next();
};

module.exports = { auth, adminOnly, coordinatorOnly };
