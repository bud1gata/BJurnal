const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true
  },
  nomorInduk: {
    type: String,
    required: [true, 'Nomor Induk wajib diisi'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi'],
    minlength: 6,
    select: false // Default do not return password in queries
  },
  role: {
    type: String,
    enum: ['murid', 'guru', 'admin'],
    required: true
  },
  kelas: {
    type: String,
    required: function() { return this.role === 'murid'; }
  },
  requestedKelas: {
    type: String,
    default: null
  },
  isPendingApproval: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Enkripsi password sebelum save
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method untuk verifikasi password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
