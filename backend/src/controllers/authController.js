const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Admin = require('../models/Admin');
const PasswordReset = require('../models/PasswordReset');
const config = require('../config');
const {
  sendPasswordResetEmail,
  sendPasswordResetSMS,
  isEmailConfigured,
  isSmsConfigured,
} = require('../services/notificationService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

// Register new user
const register = async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { email, password, firstName, lastName, phone, role = 'ADVERTISER' } = req.body;
    
    console.log('Extracted data:', { email, password: '***', firstName, lastName, phone, role });

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User with email already exists:', existingUser.email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if phone is provided and unique
    console.log('Checking for existing user with phone:', phone);
    if (phone) {
      const existingPhone = await User.findOne({ phone });

      if (existingPhone) {
        console.log('User with phone already exists:', existingPhone.phone);
        return res.status(400).json({ error: 'User with this phone number already exists' });
      }
    }

    // Create user (password will be hashed by pre-save middleware)
    console.log('Creating new user...');
    const user = new User({
      email,
      password,
      phone
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Create profile
    console.log('Creating profile...');
    const profile = new Profile({
      userId: user._id,
      firstName,
      lastName,
      role: role.toUpperCase() // Convert to uppercase to match Profile model enum
    });

    console.log('Saving profile to database...');
    console.log('Profile data:', { userId: user._id, firstName, lastName, role: role.toUpperCase() });
    await profile.save();
    console.log('Profile saved successfully with ID:', profile._id);

    // Generate token
    console.log('Generating JWT token...');
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    // Populate user with profile
    console.log('Populating user with profile...');
    const userWithProfile = await User.findById(user._id)
      .populate('profile')
      .select('-password');
    console.log('User populated successfully');

    console.log('Registration successful! Sending response...');
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithProfile
    });
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Build query to find user by email or phone
    const query = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    }

    // Find user with profile and admin status
    const user = await User.findOne(query)
      .populate('profile')
      .populate('admin');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (password is already excluded by toJSON method)
    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('profile')
      .populate('admin');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, avatarUrl, role, phone } = req.body;

    // Prepare update object
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    // If role is being updated to ADMIN, create admin record
    if (role === 'ADMIN') {
      const existingAdmin = await Admin.findOne({ userId: req.user.id });
      if (!existingAdmin) {
        await Admin.create({ userId: req.user.id });
      }
    }

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Verify phone number (placeholder - implement SMS verification)
const verifyPhone = async (req, res) => {
  try {
    const { phone, verificationCode } = req.body;

    // TODO: Implement actual SMS verification with Twilio
    // For now, just mark as verified if code is provided
    if (verificationCode) {
      await User.findByIdAndUpdate(req.user.id, {
        phone,
        isVerified: true
      });

      res.json({ message: 'Phone number verified successfully' });
    } else {
      res.status(400).json({ error: 'Verification code is required' });
    }
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Build query to find user by email or phone
    const query = {};
    let contactMethod = '';
    let contactValue = '';
    
    if (email) {
      query.email = email;
      contactMethod = 'email';
      contactValue = email;
    } else if (phone) {
      query.phone = phone;
      contactMethod = 'phone';
      contactValue = phone;
    } else {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Find user
    const user = await User.findOne(query);
    
    if (!user) {
      // For security, don't reveal if user exists or not
      return res.json({ 
        message: 'If an account exists with this information, a reset code has been sent.' 
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate any previous unused reset codes for this user
    await PasswordReset.updateMany(
      { userId: user._id, isUsed: false },
      { isUsed: true }
    );

    // Create password reset record
    const passwordReset = new PasswordReset({
      userId: user._id,
      resetCode,
      contactMethod,
      contactValue,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    await passwordReset.save();

    let delivered = false;

    try {
      if (contactMethod === 'email') {
        delivered = await sendPasswordResetEmail({
          to: contactValue,
          code: resetCode,
          expiresInMinutes: 15
        });
      } else if (contactMethod === 'phone') {
        delivered = await sendPasswordResetSMS({
          to: contactValue,
          code: resetCode,
          expiresInMinutes: 15
        });
      }
    } catch (notificationError) {
      console.error('Failed to dispatch password reset notification:', notificationError);
    }

    if (!delivered) {
      console.warn(`Password reset code generated but delivery failed via ${contactMethod}.`);
    }

    if (config.NODE_ENV !== 'production') {
      console.log(`Password reset code for ${contactMethod} ${contactValue}: ${resetCode}`);
    }

    const responsePayload = { 
      message: 'If an account exists with this information, a reset code has been sent.',
      deliveryMethod: contactMethod,
      delivered
    };

    if (!delivered || config.NODE_ENV !== 'production') {
      responsePayload.resetCode = resetCode;
    }
    
    if (contactMethod === 'email' && !isEmailConfigured) {
      responsePayload.deliveryWarning = 'Email credentials are not configured. Reset code shown for testing.';
    }

    if (contactMethod === 'phone' && !isSmsConfigured) {
      responsePayload.deliveryWarning = 'SMS credentials are not configured. Reset code shown for testing.';
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify reset code
const verifyResetCode = async (req, res) => {
  try {
    const { email, phone, resetCode } = req.body;

    if (!resetCode) {
      return res.status(400).json({ error: 'Reset code is required' });
    }

    // Build query to find user
    const query = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    } else {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Find user
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Find valid reset code
    const passwordReset = await PasswordReset.findOne({
      userId: user._id,
      resetCode,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!passwordReset) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Increment attempts
    passwordReset.attempts += 1;
    await passwordReset.save();

    res.json({ 
      message: 'Reset code verified successfully.',
      verified: true
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password with code
const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, phone, resetCode, newPassword } = req.body;

    if (!resetCode || !newPassword) {
      return res.status(400).json({ error: 'Reset code and new password are required' });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Build query to find user
    const query = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    } else {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Find user
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Find valid reset code
    const passwordReset = await PasswordReset.findOne({
      userId: user._id,
      resetCode,
      isUsed: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!passwordReset) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Mark reset code as used
    passwordReset.isUsed = true;
    await passwordReset.save();

    // Invalidate all other reset codes for this user
    await PasswordReset.updateMany(
      { userId: user._id, _id: { $ne: passwordReset._id }, isUsed: false },
      { isUsed: true }
    );

    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyPhone,
  requestPasswordReset,
  verifyResetCode,
  resetPasswordWithCode
};

