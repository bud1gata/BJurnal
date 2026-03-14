const express = require('express');
const router = express.Router();
const {
  createNote,
  autoSaveNote,
  submitNote,
  getArchiveNotes,
  getNoteById
} = require('../controllers/noteController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, restrictTo('murid'), createNote);

router.route('/archive')
  .get(protect, restrictTo('murid'), getArchiveNotes);

router.route('/:id')
  .get(protect, getNoteById);

router.route('/:id/autosave')
  .put(protect, restrictTo('murid'), autoSaveNote);

router.route('/:id/submit')
  .put(protect, restrictTo('murid'), submitNote);

module.exports = router;
