const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'aptitude', 'interview', 'selected', 'rejected'],
    default: 'applied'
  }
}, { timestamps: true });

// A student can only apply once to a specific drive
ApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
