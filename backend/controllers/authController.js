const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { nama, nomorInduk, password, role, kelas } = req.body;

    // Cek jika user sudah ada
    const userExists = await User.findOne({ nomorInduk });

    if (userExists) {
      return res.status(400).json({ message: 'User dengan nomor induk tersebut sudah terdaftar' });
    }

    // Role validation
    if (role !== 'murid' && role !== 'guru') {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    if (role === 'murid' && !kelas) {
      return res.status(400).json({ message: 'Kelas wajib diisi untuk murid' });
    }

    const userData = {
      nama,
      nomorInduk,
      password,
      role
    };

    if (role === 'murid') {
      userData.kelas = kelas;
    }

    const user = await User.create({ ...userData, isApproved: false });

    if (user) {
      res.status(201).json({
        _id: user.id,
        nama: user.nama,
        nomorInduk: user.nomorInduk,
        role: user.role,
        kelas: user.kelas,
        requestedKelas: user.requestedKelas,
        isPendingApproval: user.isPendingApproval,
        isApproved: user.isApproved,
        message: 'Registrasi berhasil. Akun Anda sedang menunggu persetujuan admin.'
      });
    } else {
      res.status(400).json({ message: 'Data user tidak valid' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { nomorInduk, password } = req.body;

    // Check for user email
    const user = await User.findOne({ nomorInduk }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (!user.isApproved) {
        return res.status(403).json({ message: 'Akun Anda belum disetujui oleh admin. Silakan hubungi admin.' });
      }

      res.json({
        _id: user.id,
        nama: user.nama,
        nomorInduk: user.nomorInduk,
        role: user.role,
        kelas: user.kelas,
        requestedKelas: user.requestedKelas,
        isPendingApproval: user.isPendingApproval,
        isApproved: user.isApproved,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Nomor Induk atau Password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user.id,
        nama: user.nama,
        nomorInduk: user.nomorInduk,
        role: user.role,
        kelas: user.kelas,
        requestedKelas: user.requestedKelas,
        isPendingApproval: user.isPendingApproval,
        isApproved: user.isApproved
      });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (user.role === 'murid') {
        return res.status(403).json({ message: 'Murid tidak diperbolehkan mengedit profil sendiri' });
      }
      user.nama = req.body.nama || user.nama;
      
      if (user.role === 'murid' && req.body.kelas) {
        // Jika kelas berubah, buat request persetujuan
        if (req.body.kelas !== user.kelas) {
          user.requestedKelas = req.body.kelas;
          user.isPendingApproval = true;
          // Jangan update user.kelas sekarang
        }
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        nama: updatedUser.nama,
        nomorInduk: updatedUser.nomorInduk,
        role: updatedUser.role,
        kelas: updatedUser.kelas,
        requestedKelas: updatedUser.requestedKelas,
        isPendingApproval: updatedUser.isPendingApproval,
        isApproved: updatedUser.isApproved,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password saat ini dan password baru wajib diisi' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
      if (currentPassword === newPassword) {
        return res.status(400).json({ message: 'Password baru tidak boleh sama dengan password saat ini' });
      }
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password berhasil diperbarui' });
    } else {
      res.status(401).json({ message: 'Password saat ini salah' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
};
