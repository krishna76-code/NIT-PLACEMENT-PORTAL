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

// GET Student Dashboard Stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this.' });
    }

    const Application = require('../models/Application');
    const Drive = require('../models/Drive');

    const profile = await StudentProfile.findOne({ user: req.user.id });
    const cgpa = profile ? profile.cgpa : 0;

    const applications = await Application.find({ student: req.user.id }).populate('drive');
    const appliedCount = applications.length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    // Find all upcoming drives
    const upcomingDrives = await Drive.find({ status: 'upcoming' });
    
    // Eligible count: upcoming drives where cgpaReq <= student's cgpa
    const eligibleCount = upcomingDrives.filter(d => d.cgpaReq <= cgpa).length;

    // Upcoming deadlines: upcoming drives that the student hasn't applied to yet
    const appliedDriveIds = applications.map(a => a.drive ? a.drive._id.toString() : '');
    const upcomingDeadlines = upcomingDrives
      .filter(d => !appliedDriveIds.includes(d._id.toString()))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5); // top 5

    res.json({
      appliedCount,
      eligibleCount,
      rejectedCount,
      upcomingDeadlines
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
