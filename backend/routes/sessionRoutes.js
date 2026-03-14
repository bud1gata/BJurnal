const express = require('express');
const router = express.Router();
const {
  getActiveSessions,
  getTeacherSessions,
  getSessionById,
  createSession,
  closeSession,
  getSessionTracker
} = require('../controllers/sessionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, restrictTo('guru'), createSession);

router.route('/active')
  .get(protect, restrictTo('murid'), getActiveSessions);

router.route('/me')
  .get(protect, restrictTo('guru'), getTeacherSessions);

router.route('/:id')
  .get(protect, getSessionById);

router.route('/:id/close')
  .put(protect, restrictTo('guru'), closeSession);

router.route('/:id/tracker')
  .get(protect, restrictTo('guru'), getSessionTracker);

module.exports = router;
