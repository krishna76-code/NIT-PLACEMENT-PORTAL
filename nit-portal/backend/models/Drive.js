const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  branches: { type: [String], required: true },
  program: { type: String, required: true, default: 'B.Tech' },
  cgpaReq: { type: Number, default: 0 },
  backlogsAllowed: { type: Number, default: 0 },
  ctc: { type: Number, default: 0 },           // CTC in LPA
  driveType: {
    type: String,
    enum: ['On Campus', 'Off Campus'],
    default: 'On Campus'
  },
  offerType: {
    type: String,
    enum: ['6 Months Internship + PPO', 'Full Time Employment (FTE)', '6 Months Internship + FTE', 'Internship Only (6 Months)'],
    default: 'Full Time Employment (FTE)'
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'completed'
  },
  logo: { type: String, default: '' },
  batches: { type: [String], default: ['2026'] },
  postedBy: { type: String, default: 'admin' },
  // Company Profile fields
  companyOverview: { type: String, default: '' },
  hiringProcess: { type: String, default: '' },
  previousQuestions: { type: String, default: '' },
  eligibilityCriteria: { type: String, default: '' },
  requiredSkills: { type: [String], default: [] },
  location: { type: String, default: '' },
  // Timeline Dates
  registrationStart: { type: Date },
  registrationEnd: { type: Date },
  testDate: { type: Date },
  interviewDate: { type: Date },
  resultDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Drive', DriveSchema);
