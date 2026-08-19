import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env file before accessing process.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const createAdminAccount = async () => {
  try {
    // 2. Read MONGODB_URI (or MONGO_URI fallback)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI environment variable is not defined.');
      console.error('👉 Please set MONGODB_URI in your server/.env file or environment variables.');
      process.exit(1);
    }

    // 3. Read Admin credentials from .env
    const email = (process.env.ADMIN_EMAIL || 'admin@goatournament.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'AdminGoa2026!';
    const name = process.env.ADMIN_NAME || 'Platform Administrator';

    console.log(`Connecting to MongoDB Atlas...`);

    // Configure Mongoose options identically to main app
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ [MongoDB] Connected successfully to Atlas: ${conn.connection.host}/${conn.connection.name}`);

    // 4. Check whether Admin already exists
    let adminUser = await User.findOne({ email });

    if (adminUser) {
      if (adminUser.role === 'ADMIN' && adminUser.isActive !== false) {
        console.log(`ℹ️ Admin account with email "${email}" already exists. No duplicate account created.`);
      } else {
        // Elevate existing account to ADMIN
        adminUser.role = 'ADMIN';
        adminUser.isActive = true;
        await adminUser.save();
        console.log(`✅ Existing user "${email}" successfully elevated to ADMIN role.`);
      }
    } else {
      // 5. Create new Admin account (Password is hashed automatically by User model pre-save hook using bcrypt)
      adminUser = await User.create({
        name,
        email,
        password,
        role: 'ADMIN',
        isActive: true,
        location: 'Panaji, Goa',
      });
      console.log(`✅ New Admin account successfully created!`);
      console.log(`   Name:  ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Role:  ADMIN`);
    }

    // 6. Close MongoDB connection cleanly
    await mongoose.connection.close();
    console.log('✅ [MongoDB] Connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to create Admin account: ${error.message}`);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.error('👉 Please check your MONGODB_URI connection string in server/.env.');
      console.error('👉 Make sure to replace default placeholder credentials with your real MongoDB Atlas connection string and whitelist 0.0.0.0/0 in Atlas Network Access.');
    }
    process.exit(1);
  }
};

createAdminAccount();
