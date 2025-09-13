const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUUID, validatePagination } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', validatePagination, adminController.getAllUsers);

// Complaints
router.get('/complaints', validatePagination, adminController.getAllComplaints);
router.get('/complaints/:id', validateUUID('id'), adminController.getComplaintById);
router.put('/complaints/:id', validateUUID('id'), adminController.updateComplaint);

// Disputes
router.get('/disputes', validatePagination, adminController.getAllDisputes);
router.get('/disputes/:id', validateUUID('id'), adminController.getDisputeById);
router.put('/disputes/:id', validateUUID('id'), adminController.updateDispute);

// Billboard approvals
router.get('/billboards/pending', validatePagination, adminController.getPendingBillboards);
router.put('/billboards/:id/approval', validateUUID('id'), adminController.updateBillboardApproval);

module.exports = router;

