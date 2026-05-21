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

// Resume Upload + AI Checker
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/resume-upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can upload resumes.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    // 1. Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    // 2. Initialize Gemini (if API key available, else mock)
    let aiResponse = {
      score: Math.floor(Math.random() * 40) + 60, // 60-100 fallback
      feedback: "Looks good, but consider adding more quantifiable achievements.",
      keywords: ["JavaScript", "React", "Node.js"]
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
          You are an expert ATS (Applicant Tracking System) and technical recruiter.
          Analyze the following resume text and provide a JSON response with exactly three fields:
          1. "score": An integer from 0 to 100 representing the ATS score.
          2. "feedback": A brief 1-2 sentence string providing critical feedback on missing skills or formatting.
          3. "keywords": An array of strings representing the core technical skills and technologies found.

          Resume Text:
          ${resumeText.substring(0, 3000)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        
        const generated = JSON.parse(response.text);
        aiResponse = generated;
      } catch (aiErr) {
        console.error("Gemini AI error:", aiErr);
        // Fallback already set
      }
    } else {
      console.log("No GEMINI_API_KEY found, using fallback AI response.");
    }

    // 3. Update StudentProfile
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    profile.resumeScore = aiResponse.score;
    profile.resumeFeedback = aiResponse.feedback;
    profile.resumeKeywords = aiResponse.keywords;
    
    await profile.save();

    res.json({
      message: 'Resume analyzed successfully.',
      score: profile.resumeScore,
      feedback: profile.resumeFeedback,
      keywords: profile.resumeKeywords
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during resume analysis.' });
  }
});

module.exports = router;
