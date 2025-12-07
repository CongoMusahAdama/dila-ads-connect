const { Billboard, User, BookingRequest, Complaint } = require('../models');
const path = require('path');
const fs = require('fs');

// Get all billboards (public - available ones, or all for owners)
const getAllBillboards = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location, minPrice, maxPrice, size } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query - owners can see all billboards, others see only available and approved
    const query = {};

    // If user is not authenticated or not an owner, show only available and approved billboards
    if (!req.user || req.user.role !== 'OWNER') {
      query.isAvailable = true;
      query.isApproved = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (size) {
      query.size = { $regex: size, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
    }

    const [billboards, total] = await Promise.all([
      Billboard.find(query)
        .populate({
          path: 'ownerId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Billboard.countDocuments(query)
    ]);

    res.json({
      billboards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all billboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get billboard by ID
const getBillboardById = async (req, res) => {
  try {
    const { id } = req.params;

    const billboard = await Billboard.findById(id)
      .populate({
        path: 'ownerId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      });

    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    // Check if user can view this billboard
    // Public if available and approved, or if user is the owner
    if (!billboard.isAvailable || !billboard.isApproved) {
      if (!req.user || billboard.ownerId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ billboard });
  } catch (error) {
    console.error('Get billboard by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's own billboards
const getMyBillboards = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [billboards, total] = await Promise.all([
      Billboard.find({ ownerId: req.user._id })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Billboard.countDocuments({ ownerId: req.user._id })
    ]);

    res.json({
      billboards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my billboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new billboard
const createBillboard = async (req, res) => {
  try {
    const {
      name,
      location,
      size,
      pricePerDay,
      description,
      phone,
      email
    } = req.body;

    // Handle image upload
    let imageUrl = req.body.imageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const billboard = new Billboard({
      ownerId: req.user._id,
      name,
      location,
      size,
      pricePerDay: parseFloat(pricePerDay),
      description,
      phone,
      email,
      email,
      imageUrl,
      status: 'PENDING',
      isApproved: false
    });

    await billboard.save();

    await billboard.populate({
      path: 'ownerId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName'
      }
    });

    res.status(201).json({
      message: 'Billboard created successfully',
      billboard
    });
  } catch (error) {
    console.error('Create billboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update billboard
const updateBillboard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      size,
      pricePerDay,
      description,
      phone,
      email,
      isAvailable
    } = req.body;

    // Check if billboard exists and user owns it
    const existingBillboard = await Billboard.findById(id);

    if (!existingBillboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    if (existingBillboard.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Handle image upload
    let imageUrl = existingBillboard.imageUrl;

    // If a new image URL is provided in body, use it
    if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    if (req.file) {
      // Delete old image if exists and is a local file
      if (existingBillboard.imageUrl && existingBillboard.imageUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), 'uploads', path.basename(existingBillboard.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updateData = {
      name,
      location,
      size,
      description,
      phone,
      email,
      imageUrl
    };

    if (pricePerDay !== undefined) updateData.pricePerDay = parseFloat(pricePerDay);
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    // If it was rejected, reset to pending on update
    if (existingBillboard.status === 'REJECTED') {
      updateData.status = 'PENDING';
      updateData.isApproved = false;
      updateData.rejectionReason = null;
    }

    const updatedBillboard = await Billboard.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'ownerId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName'
      }
    });

    res.json({
      message: 'Billboard updated successfully',
      billboard: updatedBillboard
    });
  } catch (error) {
    console.error('Update billboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete billboard
const deleteBillboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if billboard exists and user owns it
    const existingBillboard = await Billboard.findById(id);

    if (!existingBillboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    if (existingBillboard.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete associated image
    if (existingBillboard.imageUrl) {
      const imagePath = path.join(process.cwd(), 'uploads', path.basename(existingBillboard.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete billboard
    await Billboard.findByIdAndDelete(id);

    res.json({ message: 'Billboard deleted successfully' });
  } catch (error) {
    console.error('Delete billboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get featured billboards (for homepage)
const getFeaturedBillboards = async (req, res) => {
  try {
    const billboards = await Billboard.find({
      isAvailable: true,
      isApproved: true
    })
      .populate({
        path: 'ownerId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      })
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({ billboards });
  } catch (error) {
    console.error('Get featured billboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get owner dashboard statistics
const getOwnerDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const [
      totalBillboards,
      activeBillboards,
      pendingRequests,
      totalBookings,
      totalRevenue,
      recentBookings
    ] = await Promise.all([
      // Total billboards owned by this user
      Billboard.countDocuments({ ownerId }),

      // Active (available and approved) billboards
      Billboard.countDocuments({
        ownerId,
        isAvailable: true,
        isApproved: true
      }),

      // Pending booking requests for user's billboards
      BookingRequest.countDocuments({
        status: 'pending',
        billboardId: { $in: await Billboard.find({ ownerId }).distinct('_id') }
      }),

      // Total bookings for user's billboards
      BookingRequest.countDocuments({
        status: 'confirmed',
        billboardId: { $in: await Billboard.find({ ownerId }).distinct('_id') }
      }),

      // Total revenue from confirmed bookings
      BookingRequest.aggregate([
        {
          $match: {
            status: 'confirmed',
            billboardId: { $in: await Billboard.find({ ownerId }).distinct('_id') }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Recent bookings for user's billboards
      BookingRequest.find({
        billboardId: { $in: await Billboard.find({ ownerId }).distinct('_id') }
      })
        .populate({
          path: 'billboardId',
          select: 'name location'
        })
        .populate({
          path: 'advertiserId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        })
        .limit(5)
        .sort({ createdAt: -1 })
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const occupancyRate = totalBillboards > 0 ? Math.round((activeBillboards / totalBillboards) * 100) : 0;

    res.json({
      stats: {
        totalBillboards,
        activeBillboards,
        pendingRequests,
        totalBookings,
        totalRevenue: revenue,
        occupancyRate
      },
      recentBookings
    });
  } catch (error) {
    console.error('Get owner dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllBillboards,
  getBillboardById,
  getMyBillboards,
  createBillboard,
  updateBillboard,
  deleteBillboard,
  getFeaturedBillboards,
  getOwnerDashboardStats
};