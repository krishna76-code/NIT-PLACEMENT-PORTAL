const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  branch: { type: String, required: true },
  program: { type: String, required: true, default: 'B.Tech' },
  cgpaReq: { type: Number, default: 0 },
  ctc: { type: Number, default: 0 },           // CTC in LPA
  driveType: {
    type: String,
    enum: ['on-campus', 'off-campus', 'ppo', 'internship'],
    default: 'on-campus'
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'completed'
  },
  logo: { type: String, default: '' },
  batch: { type: String, default: '2026' },
  postedBy: { type: String, default: 'admin' },
  // Company Profile fields
  companyOverview: { type: String, default: '' },
  hiringProcess: { type: String, default: '' },
  previousQuestions: { type: String, default: '' },
  eligibilityCriteria: { type: String, default: '' },
  location: { type: String, default: '' },
  // Timeline Dates
  registrationStart: { type: Date },
  registrationEnd: { type: Date },
  testDate: { type: Date },
  interviewDate: { type: Date },
  resultDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Drive', DriveSchema);
