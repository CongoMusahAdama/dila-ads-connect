const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/auth');
const { validateComplaint, validateUUID, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// User complaint routes
router.post('/', validateComplaint, complaintController.createComplaint);
router.get('/my', validatePagination, complaintController.getMyComplaints);
router.get('/:id', validateUUID('id'), complaintController.getComplaintById);

module.exports = router;

