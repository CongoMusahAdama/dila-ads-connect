const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Profile = require('./src/models/Profile');
const Admin = require('./src/models/Admin');
const config = require('./src/config');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'dilads@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('dila12345', 10);

    // Create the admin user
    const adminUser = new User({
      email: 'dilads@gmail.com',
      password: hashedPassword,
      isVerified: true
    });

    await adminUser.save();
    console.log('Admin user created');

    // Create the admin profile
    const adminProfile = new Profile({
      userId: adminUser._id,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    });

    await adminProfile.save();
    console.log('Admin profile created');

    // Create the admin record
    const admin = new Admin({
      userId: adminUser._id
    });

    await admin.save();
    console.log('Admin record created');

    console.log('Admin setup completed successfully!');
    console.log('Email: dilads@gmail.com');
    console.log('Password: dila12345');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createAdmin();
