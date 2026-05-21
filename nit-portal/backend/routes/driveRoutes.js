const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Drive = require('../models/Drive');
const { auth, coordinatorOnly } = require('../middleware/auth');

// GET all drives — public, with filtering & search
router.get('/', async (req, res) => {
  try {
    const { branch, status, driveType, offerType, search, batch, packageMin, packageMax, location, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (branch) filter.branches = { $in: branch.split(',') };
    if (batch) filter.batches = { $in: batch.split(',') };
    if (status) filter.status = status;
    if (driveType) filter.driveType = driveType;
    if (offerType) filter.offerType = offerType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) filter.company = { $regex: search, $options: 'i' };
    
    if (packageMin || packageMax) {
      filter.ctc = {};
      if (packageMin) filter.ctc.$gte = Number(packageMin);
      if (packageMax) filter.ctc.$lte = Number(packageMax);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Drive.countDocuments(filter);
    const drives = await Drive.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // AI Match Score Logic
    const jwt = require('jsonwebtoken');
    const StudentProfile = require('../models/StudentProfile');
    let studentProfile = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nit-secret');
        if (decoded.user.role === 'student') {
          studentProfile = await StudentProfile.findOne({ user: decoded.user.id });
        }
      } catch (e) {
        // token err ignored for public route
      }
    }

    const drivesWithMatch = drives.map(d => {
      let matchScore = null;
      if (studentProfile && studentProfile.resumeKeywords?.length > 0 && d.requiredSkills?.length > 0) {
        const studentKWs = studentProfile.resumeKeywords.map(k => k.toLowerCase().trim());
        const driveReqs = d.requiredSkills.map(k => k.toLowerCase().trim());
        const matchCount = driveReqs.filter(req => studentKWs.includes(req) || studentKWs.some(sk => sk.includes(req) || req.includes(sk))).length;
        matchScore = Math.round((matchCount / driveReqs.length) * 100);
      }
      return { ...d.toObject(), matchScore };
    });

    res.json({ drives: drivesWithMatch, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET single drive
router.get('/:id', async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST new drive — protected
router.post('/',
  auth,
  coordinatorOnly,
  [
    body('company').trim().notEmpty().withMessage('Company name is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('count').isInt({ min: 0 }).withMessage('Count must be a non-negative number'),
    body('branches').isArray({ min: 1 }).withMessage('At least one branch is required'),
    body('batches').isArray({ min: 1 }).withMessage('At least one batch is required'),
    body('ctc').optional().isFloat({ min: 0 }),
    body('backlogsAllowed').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const drive = new Drive({ ...req.body, postedBy: req.user.username });
      const saved = await drive.save();

      // Notify all students
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      const students = await User.find({ role: 'student' }).select('_id');
      const notifications = students.map(s => ({
        user: s._id,
        title: 'New Drive Posted',
        message: `${saved.company} has posted a new drive for ${saved.role}.`,
        type: 'drive',
        link: '/drives'
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ message: 'Could not save drive.' });
    }
  }
);

// PUT update drive — protected
router.put('/:id', auth, coordinatorOnly, async (req, res) => {
  try {
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    res.json(drive);
  } catch (err) {
    res.status(400).json({ message: 'Could not update drive.' });
  }
});

// DELETE drive — protected
router.delete('/:id', auth, coordinatorOnly, async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    res.json({ message: 'Drive deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
