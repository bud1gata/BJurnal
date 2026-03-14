const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul materi wajib diisi'],
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  kelas: {
    type: String,
    required: [true, 'Kelas target wajib diisi']
  },
  duration: {
    type: Number,
    required: [true, 'Durasi wajib diisi (dalam menit)']
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  endTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
