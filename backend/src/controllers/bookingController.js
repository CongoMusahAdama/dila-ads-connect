const { BookingRequest, Billboard, User } = require('../models');

// Create booking request
const createBookingRequest = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { billboardId, startDate, endDate, message } = req.body;

    // Check if billboard exists and is available
    console.log('Looking for billboard with ID:', billboardId);
    const billboard = await Billboard.findById(billboardId)
      .populate('ownerId', 'email');
    
    console.log('Found billboard:', billboard);

    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    if (!billboard.isAvailable || !billboard.isApproved) {
      return res.status(400).json({ error: 'Billboard is not available for booking' });
    }

    // Check if user is trying to book their own billboard
    if (billboard.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot book your own billboard' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await BookingRequest.findOne({
      billboardId,
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        {
          $and: [
            { startDate: { $lte: start } },
            { endDate: { $gt: start } }
          ]
        },
        {
          $and: [
            { startDate: { $lt: end } },
            { endDate: { $gte: end } }
          ]
        },
        {
          $and: [
            { startDate: { $gte: start } },
            { endDate: { $lte: end } }
          ]
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ error: 'This billboard is already booked for the selected dates' });
    }

    // Calculate total amount
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = daysDiff * billboard.pricePerDay;
    
    console.log('Calculated total amount:', totalAmount, 'for', daysDiff, 'days');

    // Create booking request
    const bookingRequestData = {
      billboardId,
      advertiserId: req.user._id,
      startDate: start,
      endDate: end,
      totalAmount,
      message
    };
    
    console.log('Creating booking request with data:', bookingRequestData);
    const bookingRequest = new BookingRequest(bookingRequestData);

    console.log('Saving booking request...');
    await bookingRequest.save();
    console.log('Booking request saved successfully');

    console.log('Populating booking request...');
    await bookingRequest.populate([
      {
        path: 'billboardId',
        populate: {
          path: 'ownerId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      },
      {
        path: 'advertiserId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      }
    ]);
    console.log('Booking request populated successfully');

    res.status(201).json({
      message: 'Booking request created successfully',
      bookingRequest
    });
  } catch (error) {
    console.error('Create booking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's booking requests (as advertiser)
const getMyBookingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { advertiserId: req.user._id };
    if (status) {
      query.status = status;
    }

    const [bookingRequests, total] = await Promise.all([
      BookingRequest.find(query)
        .populate({
          path: 'billboardId',
          select: 'name location imageUrl size pricePerDay',
          populate: {
            path: 'ownerId',
            select: 'email',
            populate: {
              path: 'profile',
              select: 'firstName lastName'
            }
          }
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      BookingRequest.countDocuments(query)
    ]);

    res.json({
      bookingRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my booking requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get booking requests for user's billboards (as owner)
const getBillboardBookingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's billboard IDs
    const userBillboards = await Billboard.find(
      { ownerId: req.user._id },
      '_id'
    );

    const billboardIds = userBillboards.map(b => b._id);

    if (billboardIds.length === 0) {
      return res.json({
        bookingRequests: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    const query = { billboardId: { $in: billboardIds } };
    if (status) {
      query.status = status;
    }

    const [bookingRequests, total] = await Promise.all([
      BookingRequest.find(query)
        .populate('billboardId', 'name location')
        .populate({
          path: 'advertiserId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      BookingRequest.countDocuments(query)
    ]);

    res.json({
      bookingRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get billboard booking requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get booking request by ID
const getBookingRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const bookingRequest = await BookingRequest.findById(id)
      .populate([
        {
          path: 'billboardId',
          populate: {
            path: 'ownerId',
            select: 'email',
            populate: {
              path: 'profile',
              select: 'firstName lastName'
            }
          }
        },
        {
          path: 'advertiserId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ]);

    if (!bookingRequest) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    // Check if user has access to this booking request
    const hasAccess = 
      bookingRequest.advertiserId._id.toString() === req.user._id.toString() || 
      bookingRequest.billboardId.ownerId._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ bookingRequest });
  } catch (error) {
    console.error('Get booking request by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update booking request status (for billboard owners)
const updateBookingRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    // Check if booking request exists
    const existingRequest = await BookingRequest.findById(id)
      .populate('billboardId', 'ownerId');

    if (!existingRequest) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    // Check if user owns the billboard
    if (existingRequest.billboardId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if request is still pending
    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking request has already been processed' });
    }

    // Update booking request
    const updatedRequest = await BookingRequest.findByIdAndUpdate(
      id,
      { status, responseMessage },
      { new: true }
    ).populate([
      {
        path: 'billboardId',
        populate: {
          path: 'ownerId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      },
      {
        path: 'advertiserId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      }
    ]);

    res.json({
      message: `Booking request ${status.toLowerCase()} successfully`,
      bookingRequest: updatedRequest
    });
  } catch (error) {
    console.error('Update booking request status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel booking request (for advertisers)
const cancelBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking request exists
    const existingRequest = await BookingRequest.findById(id);

    if (!existingRequest) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    // Check if user is the advertiser
    if (existingRequest.advertiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if request can be cancelled
    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending booking requests can be cancelled' });
    }

    // Update booking request
    const updatedRequest = await BookingRequest.findByIdAndUpdate(
      id,
      { status: 'REJECTED' },
      { new: true }
    ).populate([
      {
        path: 'billboardId',
        populate: {
          path: 'ownerId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      },
      {
        path: 'advertiserId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      }
    ]);

    res.json({
      message: 'Booking request cancelled successfully',
      bookingRequest: updatedRequest
    });
  } catch (error) {
    console.error('Cancel booking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create dispute for booking request
const createDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { disputeReason } = req.body;

    // Check if booking request exists
    const existingRequest = await BookingRequest.findById(id)
      .populate('billboardId', 'ownerId');

    if (!existingRequest) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    // Check if user has access to this booking request
    const hasAccess = 
      existingRequest.advertiserId.toString() === req.user._id.toString() || 
      existingRequest.billboardId.ownerId.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if dispute can be created
    if (existingRequest.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Disputes can only be created for approved bookings' });
    }

    if (existingRequest.hasDispute) {
      return res.status(400).json({ error: 'Dispute already exists for this booking' });
    }

    // Update booking request with dispute
    const updatedRequest = await BookingRequest.findByIdAndUpdate(
      id,
      {
        hasDispute: true,
        disputeReason,
        disputeStatus: 'OPEN'
      },
      { new: true }
    ).populate([
      {
        path: 'billboardId',
        populate: {
          path: 'ownerId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      },
      {
        path: 'advertiserId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      }
    ]);

    res.json({
      message: 'Dispute created successfully',
      bookingRequest: updatedRequest
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createBookingRequest,
  getMyBookingRequests,
  getBillboardBookingRequests,
  getBookingRequestById,
  updateBookingRequestStatus,
  cancelBookingRequest,
  createDispute
};