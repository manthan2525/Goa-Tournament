import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const createAdminAccount = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI environment variable is missing.');
      process.exit(1);
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@goatournament.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'AdminGoa2026!';
    const name = process.env.ADMIN_NAME || 'Platform Administrator';

    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(mongoUri);

    let adminUser = await User.findOne({ email });

    if (adminUser) {
      if (adminUser.role !== 'ADMIN') {
        adminUser.role = 'ADMIN';
        adminUser.isActive = true;
        await adminUser.save();
        console.log(`✅ Existing user "${email}" elevated to ADMIN role.`);
      } else {
        console.log(`ℹ️ Admin user "${email}" already exists.`);
      }
    } else {
      adminUser = await User.create({
        name,
        email,
        password,
        role: 'ADMIN',
        isActive: true,
        location: 'Panaji, Goa',
      });
      console.log(`✅ New Admin account successfully created!`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to create Admin account:`, error.message);
    process.exit(1);
  }
};

createAdminAccount();
