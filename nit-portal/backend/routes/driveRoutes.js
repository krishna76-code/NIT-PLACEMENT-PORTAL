const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Drive = require('../models/Drive');
const { auth, coordinatorOnly } = require('../middleware/auth');

// GET all drives — public, with filtering & search
router.get('/', async (req, res) => {
  try {
    const { branch, status, driveType, search, batch, packageMin, packageMax, location, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (driveType) filter.driveType = driveType;
    if (batch) filter.batch = batch;
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

    res.json({ drives, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
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
    body('branch').notEmpty().withMessage('Branch is required'),
    body('ctc').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const drive = new Drive({ ...req.body, postedBy: req.user.username });
      const saved = await drive.save();
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
