const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');

// GET Current Student Profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students have profiles.' });
    }
    
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user.id });
    }
    
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// UPDATE Student Profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students have profiles.' });
    }

    const { branch, program, cgpa, phone, resumeLink, passingYear } = req.body;
    
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    profile.branch = branch !== undefined ? branch : profile.branch;
    profile.program = program !== undefined ? program : profile.program;
    profile.cgpa = cgpa !== undefined ? cgpa : profile.cgpa;
    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.resumeLink = resumeLink !== undefined ? resumeLink : profile.resumeLink;
    profile.passingYear = passingYear !== undefined ? passingYear : profile.passingYear;

    await profile.save();
    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
