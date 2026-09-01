import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { connectDB, closeDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env file before accessing process.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const createAdminAccount = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      console.error('❌ Error: MONGO_URI environment variable is not defined.');
      console.error('👉 Please set MONGO_URI in your server/.env file or environment variables.');
      process.exit(1);
    }

    const email = (process.env.ADMIN_EMAIL || 'admin@goatournament.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'AdminGoa2026!';
    const name = process.env.ADMIN_NAME || 'Platform Administrator';

    console.log(`Connecting to MongoDB Atlas...`);

    // Use shared connectDB logic to ensure identical options and dbName ('goa_tournament')
    const conn = await connectDB();
    if (!conn) {
      process.exit(1);
    }

    // Check whether Admin already exists
    let adminUser = await User.findOne({ email });

    if (adminUser) {
      if (adminUser.role === 'ADMIN' && adminUser.isActive !== false) {
        console.log(`ℹ️ Admin account with email "${email}" already exists in "${conn.connection.name}". No duplicate account created.`);
      } else {
        // Elevate existing account to ADMIN
        adminUser.role = 'ADMIN';
        adminUser.isActive = true;
        adminUser.isEmailVerified = true;
        await adminUser.save();
        console.log(`✅ Existing user "${email}" successfully elevated to active ADMIN role in "${conn.connection.name}".`);
      }
    } else {
      // Create new Admin account (Password is hashed automatically by User model pre-save hook using bcrypt)
      adminUser = await User.create({
        name,
        email,
        password,
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
        location: 'Panaji, Goa',
      });
      console.log(`✅ New Admin account successfully created in "${conn.connection.name}"!`);
      console.log(`   Name:  ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Role:  ADMIN`);
    }

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to create Admin account: ${error.message}`);
    process.exit(1);
  }
};

createAdminAccount();
