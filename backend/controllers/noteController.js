const Note = require('../models/Note');
const Session = require('../models/Session');

// @desc    Create new note (or get existing if draft)
// @route   POST /api/notes
// @access  Private (Murid)
const createNote = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Cek apakah sesi valid dan masih aktif
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Sesi tidak ditemukan' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Sesi sudah tidak aktif' });
    }

    // Cek apakah murid sudah punya catatan untuk sesi ini
    let note = await Note.findOne({
      sessionId,
      studentId: req.user._id
    });

    if (note) {
      return res.json(note); // Kembalikan existing note
    }

    // Jika belum ada, buat baru
    note = await Note.create({
      sessionId,
      studentId: req.user._id,
      studentName: req.user.nama,
      title: session.title,
      status: 'draft'
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auto-save note content & reflection
// @route   PUT /api/notes/:id/autosave
// @access  Private (Murid)
const autoSaveNote = async (req, res) => {
  try {
    const { content, reflection } = req.body;
    
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Catatan tidak ditemukan' });
    }

    if (note.studentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (note.status !== 'draft') {
      return res.status(400).json({ message: 'Tidak dapat menyimpan, catatan sudah terkirim atau terkunci' });
    }

    note.content = content !== undefined ? content : note.content;
    note.reflection = reflection !== undefined ? reflection : note.reflection;
    
    const updatedNote = await note.save();
    
    // Kirim response minimalis untuk mempercepat autosave
    res.json({ _id: updatedNote._id, updatedAt: updatedNote.updatedAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit final note
// @route   PUT /api/notes/:id/submit
// @access  Private (Murid)
const submitNote = async (req, res) => {
  try {
    const { content, reflection } = req.body;
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Catatan tidak ditemukan' });
    }

    if (note.studentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (note.status !== 'draft') {
      return res.status(400).json({ message: 'Catatan sudah terkirim atau terkunci' });
    }

    if (content !== undefined) note.content = content;
    if (reflection !== undefined) note.reflection = reflection;
    
    note.status = 'submitted';
    note.submittedAt = new Date();
    
    const updatedNote = await note.save();
    
    if (updatedNote.status !== 'submitted') {
      throw new Error('Gagal memperbarui status catatan ke "submitted"');
    }

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get archive notes for logged in student
// @route   GET /api/notes/archive
// @access  Private (Murid)
const getArchiveNotes = async (req, res) => {
  try {
    const notes = await Note.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Catatan tidak ditemukan' });
    }

    // Role check: Murid baca miliknya, Guru bisa baca
    if (req.user.role === 'murid' && note.studentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Jika guru, pastikan sesi tersebut miliknya
    if (req.user.role === 'guru') {
      const session = await Session.findById(note.sessionId);
      if (session && session.teacherId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNote,
  autoSaveNote,
  submitNote,
  getArchiveNotes,
  getNoteById
};
