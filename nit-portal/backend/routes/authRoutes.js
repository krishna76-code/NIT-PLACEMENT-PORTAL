const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Strict rate limit for auth endpoints — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true
});

// LOGIN
router.post('/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username.toLowerCase() });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: { username: user.username, role: user.role, name: user.name }
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// REGISTER NEW USER — Admin only
router.post('/register',
  auth,
  adminOnly,
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'coordinator'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { username, password, role, name } = req.body;
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(400).json({ message: 'Username already taken.' });

      const hashed = await bcrypt.hash(password, 12);
      const user = new User({
        username: username.toLowerCase(),
        password: hashed,
        role: role || 'coordinator',
        name: name || username
      });
      await user.save();
      res.status(201).json({ message: 'User created successfully.' });
    } catch (err) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// GET CURRENT USER INFO
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// REGISTER STUDENT — Public
router.post('/register-student',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      let { username, password, name } = req.body;
      username = username.toLowerCase().trim();
      
      // Optional: Enforce college domain if it's an email
      if (username.includes('@') && !username.endsWith('@nitjsr.ac.in')) {
        return res.status(400).json({ message: 'Only @nitjsr.ac.in emails are allowed.' });
      }

      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: 'Username/Email already taken.' });

      const hashed = await bcrypt.hash(password, 12);
      const user = new User({
        username,
        password: hashed,
        role: 'student',
        name
      });
      await user.save();
      
      // Auto-create an empty student profile
      const StudentProfile = require('../models/StudentProfile');
      await StudentProfile.create({ user: user._id });

      res.status(201).json({ message: 'Student registered successfully. You can now login.' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  }
);

module.exports = router;
