const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'coordinator', 'student'],
    default: 'student'
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });

// Never return password in JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
