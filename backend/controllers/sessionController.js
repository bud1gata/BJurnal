const Session = require('../models/Session');
const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Get all active sessions for a student based on class
// @route   GET /api/sessions/active
// @access  Private (Murid)
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      status: 'active',
      kelas: req.user.kelas
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sessions created by teacher
// @route   GET /api/sessions/me
// @access  Private (Guru)
const getTeacherSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ teacherId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ message: 'Sesi tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Guru)
const createSession = async (req, res) => {
  try {
    const { title, kelas, duration } = req.body;

    const session = new Session({
      title,
      teacherId: req.user._id,
      teacherName: req.user.nama,
      kelas,
      duration,
      endTime: new Date(Date.now() + duration * 60000)
    });

    const createdSession = await session.save();
    res.status(201).json(createdSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close a session manually
// @route   PUT /api/sessions/:id/close
// @access  Private (Guru)
const closeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Sesi tidak ditemukan' });
    }

    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    session.status = 'closed';
    session.endTime = new Date();
    await session.save();

    // Otomatis lock semua draft yang terhubung ke sesi ini
    await Note.updateMany(
      { sessionId: session._id, status: 'draft' },
      { $set: { status: 'locked' } }
    );

    res.json({ message: 'Sesi berhasil ditutup' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submission tracker for a session
// @route   GET /api/sessions/:id/tracker
// @access  Private (Guru)
const getSessionTracker = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Sesi tidak ditemukan' });
    }

    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Ambil semua murid di kelas tersebut saat ini
    const studentsInClass = await User.find({ role: 'murid', kelas: session.kelas })
      .select('_id nama');

    // Ambil semua notes untuk sesi ini
    const notes = await Note.find({ sessionId: session._id });

    // Gunakan Map untuk menggabungkan data agar lebih efisien dan menangani murid yang pindah kelas
    const trackerMap = new Map();

    // Pertama, masukkan semua murid yang seharusnya ada di kelas ini
    studentsInClass.forEach(student => {
      trackerMap.set(student._id.toString(), {
        studentId: student._id,
        studentName: student.nama,
        noteId: null,
        status: 'belum_masuk',
        submittedAt: null
      });
    });

    // Kedua, masukkan/update data berdasarkan catatan yang ada
    // Ini menangani murid yang mungkin sudah pindah kelas tapi punya catatan di sini
    notes.forEach(note => {
      trackerMap.set(note.studentId.toString(), {
        studentId: note.studentId,
        studentName: note.studentName, // Gunakan nama saat catatan dibuat/diupdate
        noteId: note._id,
        status: note.status,
        submittedAt: note.submittedAt
      });
    });

    const tracker = Array.from(trackerMap.values());

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveSessions,
  getTeacherSessions,
  getSessionById,
  createSession,
  closeSession,
  getSessionTracker
};
