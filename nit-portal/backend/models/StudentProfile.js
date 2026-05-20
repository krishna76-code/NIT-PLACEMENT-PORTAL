const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  branch: { type: String, default: '' },
  program: { type: String, default: 'B.Tech' },
  cgpa: { type: Number, default: 0 },
  phone: { type: String, default: '' },
  resumeLink: { type: String, default: '' },
  passingYear: { type: Number, default: new Date().getFullYear() },
  isVerified: { type: Boolean, default: false },
  idCardLink: { type: String, default: '' },
  resumeScore: { type: Number, default: null },
  resumeFeedback: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
