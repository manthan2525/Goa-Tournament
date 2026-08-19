import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const createAdminAccount = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ MONGODB_URI / MONGO_URI environment variable is missing.');
      console.error('👉 Please set MONGODB_URI in your server/.env file or environment variables.');
      process.exit(1);
    }

    // Prevent local connection fallback if explicitly expecting Atlas
    if (mongoUri.includes('127.0.0.1:27017') || mongoUri.includes('localhost:27017')) {
      console.warn('⚠️ Warning: Current MONGODB_URI points to local MongoDB (127.0.0.1:27017).');
      console.warn('👉 Replace MONGODB_URI in server/.env with your MongoDB Atlas connection string:');
      console.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/goa_tournament?retryWrites=true&w=majority');
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@goatournament.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'AdminGoa2026!';
    const name = process.env.ADMIN_NAME || 'Platform Administrator';

    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });

    let adminUser = await User.findOne({ email }).select('+password');

    if (adminUser) {
      if (adminUser.role !== 'ADMIN' || adminUser.isActive === false) {
        adminUser.role = 'ADMIN';
        adminUser.isActive = true;
        await adminUser.save();
        console.log(`✅ Existing user "${email}" elevated to active ADMIN role.`);
      } else {
        console.log(`ℹ️ Admin user "${email}" already exists with active ADMIN privileges.`);
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
      console.log(`   Role: ADMIN`);
    }

    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to create Admin account:`, error.message);
    process.exit(1);
  }
};

createAdminAccount();
