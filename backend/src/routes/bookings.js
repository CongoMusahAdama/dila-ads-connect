const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateBookingRequest, 
  validateUUID, 
  validatePagination 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Advertiser routes
router.post('/', requireRole(['ADVERTISER']), validateBookingRequest, bookingController.createBookingRequest);
router.get('/my', validatePagination, requireRole(['ADVERTISER']), bookingController.getMyBookingRequests);
router.get('/my/:id', validateUUID('id'), bookingController.getBookingRequestById);
router.put('/my/:id/cancel', validateUUID('id'), requireRole(['ADVERTISER']), bookingController.cancelBookingRequest);

// Owner routes
router.get('/billboard-requests', validatePagination, requireRole(['OWNER']), bookingController.getBillboardBookingRequests);
router.get('/:id', validateUUID('id'), bookingController.getBookingRequestById);
router.put('/:id/status', validateUUID('id'), requireRole(['OWNER']), bookingController.updateBookingRequestStatus);

// Dispute routes (both advertisers and owners can create disputes)
router.post('/:id/dispute', validateUUID('id'), bookingController.createDispute);

module.exports = router;

