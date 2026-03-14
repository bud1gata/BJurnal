const User = require('../models/User');

// @desc    Get all users with pending grade change requests
// @route   GET /api/admin/pending-requests
// @access  Private (Guru/Admin)
const getPendingRequests = async (req, res) => {
  try {
    const requests = await User.find({ isPendingApproval: true })
      .select('nama nomorInduk kelas requestedKelas updatedAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a grade change request
// @route   PUT /api/admin/approve-request/:id
// @access  Private (Guru/Admin)
const approveRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && user.isPendingApproval) {
      user.kelas = user.requestedKelas;
      user.requestedKelas = null;
      user.isPendingApproval = false;
      await user.save();

      res.json({ message: `Permintaan ${user.nama} disetujui` });
    } else {
      res.status(404).json({ message: 'Permintaan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a grade change request
// @route   PUT /api/admin/reject-request/:id
// @access  Private (Guru/Admin)
const rejectRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && user.isPendingApproval) {
      user.requestedKelas = null;
      user.isPendingApproval = false;
      await user.save();

      res.json({ message: `Permintaan ${user.nama} ditolak` });
    } else {
      res.status(404).json({ message: 'Permintaan tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve all pending grade change requests
// @route   PUT /api/admin/approve-all
// @access  Private (Guru/Admin)
const approveAllRequests = async (req, res) => {
  try {
    // Find all users with pending approval
    const pendingUsers = await User.find({ isPendingApproval: true });
    
    if (pendingUsers.length === 0) {
      return res.json({ message: 'Tidak ada permintaan pengajuan' });
    }

    // Update each user
    const updatePromises = pendingUsers.map(user => {
      user.kelas = user.requestedKelas;
      user.requestedKelas = null;
      user.isPendingApproval = false;
      return user.save();
    });

    await Promise.all(updatePromises);

    res.json({ message: `Semua ${pendingUsers.length} permintaan berhasil disetujui` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users pending account approval
// @route   GET /api/admin/pending-accounts
// @access  Private (Admin)
const getPendingAccounts = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false })
      .select('nama nomorInduk role kelas createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve an account registration
// @route   PUT /api/admin/approve-account/:id
// @access  Private (Admin)
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && !user.isApproved) {
      user.isApproved = true;
      await user.save();
      res.json({ message: `Akun ${user.nama} berhasil disetujui` });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan atau sudah disetujui' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject/Delete an account registration
// @route   DELETE /api/admin/reject-account/:id
// @access  Private (Admin)
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && !user.isApproved) {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: `Hapus pengajuan akun ${user.nama} berhasil` });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan atau sudah disetujui' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  approveAllRequests,
  getPendingAccounts,
  approveUser,
  rejectUser
};
