const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  reflection: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'locked'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure a student can only have one note per session
noteSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);
