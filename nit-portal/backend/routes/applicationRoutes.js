const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');

// STUDENT: Apply to a Drive
router.post('/:driveId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply to drives.' });
    }

    const driveId = req.params.driveId;
    const drive = await Drive.findById(driveId);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    if (drive.status !== 'upcoming') {
      return res.status(400).json({ message: 'Applications for this drive are closed.' });
    }

    // Eligibility check
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ message: 'Please complete your profile before applying.' });
    }

    if (profile.cgpa < drive.cgpaReq) {
      return res.status(400).json({ 
        message: `Eligibility failed. Drive requires minimum CGPA of ${drive.cgpaReq}, but you have ${profile.cgpa}.` 
      });
    }

    const existingApp = await Application.findOne({ student: req.user.id, drive: driveId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied to this drive.' });
    }

    const application = new Application({
      student: req.user.id,
      drive: driveId,
      status: 'applied'
    });

    await application.save();
    res.status(201).json({ message: 'Applied successfully!', application });

  } catch (err) {
    if (err.code === 11000) {
       return res.status(400).json({ message: 'You have already applied.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// STUDENT: Get My Applications
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const applications = await Application.find({ student: req.user.id })
      .populate('drive', 'company role date status driveType')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// COORDINATOR: Get All Applicants for a Drive
router.get('/drive/:driveId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Coordinator access required.' });
    }

    const applications = await Application.find({ drive: req.params.driveId })
      .populate({
        path: 'student',
        select: 'name username email'
      })
      .sort({ createdAt: -1 });

    // Also fetch their profiles manually (or populate if ref was there, but it's not)
    // We can fetch profiles in parallel
    const studentIds = applications.map(app => app.student._id);
    const profiles = await StudentProfile.find({ user: { $in: studentIds } });
    
    // Merge profiles into applications
    const appsWithProfiles = applications.map(app => {
      const p = profiles.find(prof => prof.user.toString() === app.student._id.toString());
      return { ...app.toObject(), profile: p };
    });

    res.json(appsWithProfiles);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// COORDINATOR: Update Application Status
router.put('/:appId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Coordinator access required.' });
    }

    const { status } = req.body;
    const validStatuses = ['applied', 'shortlisted', 'aptitude', 'interview', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const application = await Application.findById(req.params.appId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = status;
    await application.save();

    // Create Notification
    const Notification = require('../models/Notification');
    const drive = await Drive.findById(application.drive);
    await Notification.create({
      user: application.student,
      title: 'Application Status Updated',
      message: `Your application for ${drive.company} has been marked as ${status}.`,
      type: 'status',
      link: '/applications'
    });

    res.json({ message: 'Status updated successfully', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// STUDENT: Withdraw Application
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can withdraw.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    // Only allow withdrawal if it's still in the 'applied' state
    if (application.status !== 'applied') {
      return res.status(400).json({ 
        message: 'You cannot withdraw now as your application is already being processed.' 
      });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
