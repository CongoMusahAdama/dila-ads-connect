const express = require('express');
const router = express.Router();
const billboardController = require('../controllers/billboardController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { 
  validateBillboard, 
  validateUUID, 
  validatePagination 
} = require('../middleware/validation');

// Public routes
router.get('/', validatePagination, optionalAuth, billboardController.getAllBillboards);
router.get('/featured', billboardController.getFeaturedBillboards);
router.get('/:id', validateUUID('id'), optionalAuth, billboardController.getBillboardById);

// Protected routes - require authentication
router.use(authenticateToken);

// Owner routes
router.get('/my/list', validatePagination, requireRole(['OWNER']), billboardController.getMyBillboards);
router.get('/my/dashboard-stats', requireRole(['OWNER']), billboardController.getOwnerDashboardStats);
router.post('/', requireRole(['OWNER']), uploadSingle('image'), validateBillboard, billboardController.createBillboard);
router.put('/:id', validateUUID('id'), requireRole(['OWNER']), uploadSingle('image'), validateBillboard, billboardController.updateBillboard);
router.delete('/:id', validateUUID('id'), requireRole(['OWNER']), billboardController.deleteBillboard);

module.exports = router;

