const { Complaint, User } = require('../models');

// Create complaint
const createComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;

    const complaint = await prisma.complaint.create({
      data: {
        advertiserId: req.user.id,
        subject,
        description
      },
      include: {
        advertiser: {
          include: {
            profile: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's complaints
const getMyComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { advertiserId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.complaint.count({ where })
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
    console.error('Get my complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        advertiser: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if user has access to this complaint
    if (complaint.advertiserId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById
};

