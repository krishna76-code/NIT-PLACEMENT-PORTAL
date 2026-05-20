const express = require('express');
const router = express.Router();
const Drive = require('../models/Drive');

// GET aggregated stats for dashboard
router.get('/', async (req, res) => {
  try {
    const { batch = '2026' } = req.query;

    const drives = await Drive.find({ batch, status: 'completed' });

    const totalPlaced = drives.reduce((s, d) => s + (d.count || 0), 0);
    const totalCompanies = drives.length;
    const avgCTC = drives.length
      ? (drives.reduce((s, d) => s + (d.ctc || 0), 0) / drives.length).toFixed(2)
      : 0;
    const maxCTC = drives.length ? Math.max(...drives.map(d => d.ctc || 0)) : 0;

    // Branch-wise
    const branchMap = {};
    drives.forEach(d => {
      branchMap[d.branch] = (branchMap[d.branch] || 0) + d.count;
    });

    // Program-wise
    const programMap = {};
    drives.forEach(d => {
      programMap[d.program] = (programMap[d.program] || 0) + d.count;
    });

    // Drive type breakdown
    const typeMap = {};
    drives.forEach(d => {
      typeMap[d.driveType] = (typeMap[d.driveType] || 0) + 1;
    });

    // Monthly trend
    const monthMap = {};
    drives.forEach(d => {
      const month = d.date ? d.date.substring(0, 7) : 'Unknown';
      monthMap[month] = (monthMap[month] || 0) + d.count;
    });

    res.json({
      totalPlaced,
      totalCompanies,
      avgCTC: parseFloat(avgCTC),
      maxCTC,
      branchWise: branchMap,
      programWise: programMap,
      driveTypes: typeMap,
      monthlyTrend: monthMap
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
