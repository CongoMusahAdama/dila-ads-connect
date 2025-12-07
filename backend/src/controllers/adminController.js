const { Complaint, BookingRequest, Billboard, User } = require('../models');

// Get all complaints (admin only)
const getAllComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(where)
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
      Complaint.countDocuments(where)
    ]);

    res.json({
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate({
        path: 'advertiserId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update complaint status and response
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { status, adminResponse },
      { new: true }
    ).populate({
      path: 'advertiserId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName'
      }
    });

    res.json({
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all disputes (admin only)
const getAllDisputes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { hasDispute: true };
    if (status) {
      where.disputeStatus = status;
    }

    const [disputes, total] = await Promise.all([
      BookingRequest.find(where)
        .populate({
          path: 'billboardId',
          populate: {
            path: 'ownerId',
            select: 'email',
            populate: {
              path: 'profile',
              select: 'firstName lastName'
            }
          }
        })
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
      BookingRequest.countDocuments(where)
    ]);

    res.json({
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all disputes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dispute by ID
const getDisputeById = async (req, res) => {
  try {
    const { id } = req.params;

    const dispute = await BookingRequest.findById(id)
      .populate({
        path: 'billboardId',
        populate: {
          path: 'ownerId',
          select: 'email',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      })
      .populate({
        path: 'advertiserId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      });

    if (!dispute || !dispute.hasDispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    res.json({ dispute });
  } catch (error) {
    console.error('Get dispute by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update dispute status
const updateDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { disputeStatus } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(disputeStatus)) {
      return res.status(400).json({ error: 'Invalid dispute status' });
    }

    const updatedDispute = await BookingRequest.findByIdAndUpdate(
      id,
      { disputeStatus },
      { new: true }
    ).populate({
      path: 'billboardId',
      populate: {
        path: 'ownerId',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      }
    }).populate({
      path: 'advertiserId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName'
      }
    });

    res.json({
      message: 'Dispute updated successfully',
      dispute: updatedDispute
    });
  } catch (error) {
    console.error('Update dispute error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pending billboard approvals
const getPendingBillboards = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isApproved: false };

    const [billboards, total] = await Promise.all([
      Billboard.find(where)
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
      Billboard.countDocuments(where)
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
    console.error('Get pending billboards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or reject billboard
const updateBillboardApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ error: 'isApproved must be a boolean value' });
    }

    const updatedBillboard = await Billboard.findByIdAndUpdate(
      id,
      {
        isApproved,
        status: isApproved ? 'APPROVED' : 'REJECTED',
        ...(isApproved ? { rejectionReason: null } : { rejectionReason: req.body.rejectionReason })
      },
      { new: true }
    ).populate({
      path: 'ownerId',
      select: 'email',
      populate: {
        path: 'profile',
        select: 'firstName lastName'
      }
    });

    if (!updatedBillboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    res.json({
      message: `Billboard ${isApproved ? 'approved' : 'rejected'} successfully`,
      billboard: updatedBillboard
    });
  } catch (error) {
    console.error('Update billboard approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBillboards,
      totalBookings,
      pendingComplaints,
      pendingDisputes,
      pendingBillboards,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      Billboard.countDocuments(),
      BookingRequest.countDocuments(),
      Complaint.countDocuments({ status: 'OPEN' }),
      BookingRequest.countDocuments({ hasDispute: true, disputeStatus: 'OPEN' }),
      Billboard.countDocuments({ isApproved: false }),
      BookingRequest.find()
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

    res.json({
      stats: {
        totalUsers,
        totalBillboards,
        totalBookings,
        pendingComplaints,
        pendingDisputes,
        pendingBillboards
      },
      recentBookings
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find()
        .select('-password') // Exclude password from response
        .populate({
          path: 'profile',
          select: 'firstName lastName role phone'
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments()
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  getAllDisputes,
  getDisputeById,
  updateDispute,
  getPendingBillboards,
  updateBillboardApproval,
  getDashboardStats,
  getAllUsers
};

