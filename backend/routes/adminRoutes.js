const express = require('express');
const router = express.Router();
const { 
  getPendingRequests, 
  approveRequest, 
  rejectRequest, 
  approveAllRequests,
  getPendingAccounts,
  approveUser,
  rejectUser
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All admin routes are protected
router.use(protect);

// Grade change requests - accessible by guru or admin
router.get('/pending-requests', restrictTo('guru', 'admin'), getPendingRequests);
router.put('/approve-request/:id', restrictTo('guru', 'admin'), approveRequest);
router.put('/reject-request/:id', restrictTo('guru', 'admin'), rejectRequest);
router.put('/approve-all', restrictTo('guru', 'admin'), approveAllRequests);

// Account approvals - strictly admin only
router.get('/pending-accounts', restrictTo('admin'), getPendingAccounts);
router.put('/approve-account/:id', restrictTo('admin'), approveUser);
router.delete('/reject-account/:id', restrictTo('admin'), rejectUser);

module.exports = router;
