import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

async function setAdminPasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // 1. Admin Email: goasportx004@gmail.com
    let admin1 = await User.findOne({ email: 'goasportx004@gmail.com' });
    if (!admin1) {
      admin1 = new User({
        name: 'Platform Administrator',
        email: 'goasportx004@gmail.com',
        password: 'goasportx@123',
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
      });
      await admin1.save();
      console.log('Created Admin account: goasportx004@gmail.com');
    } else {
      admin1.password = 'goasportx@123';
      admin1.role = 'ADMIN';
      admin1.isActive = true;
      admin1.isEmailVerified = true;
      await admin1.save();
      console.log('Updated Admin account: goasportx004@gmail.com');
    }

    // 2. Admin Email: admin@goatournament.com
    let admin2 = await User.findOne({ email: 'admin@goatournament.com' });
    if (admin2) {
      admin2.password = 'goasportx@123';
      admin2.role = 'ADMIN';
      admin2.isActive = true;
      admin2.isEmailVerified = true;
      await admin2.save();
      console.log('Updated Admin account: admin@goatournament.com');
    }

    console.log('\n====================================================');
    console.log('ADMIN LOGIN CREDENTIALS READY:');
    console.log('Email 1:  goasportx004@gmail.com');
    console.log('Email 2:  admin@goatournament.com');
    console.log('Password: goasportx@123');
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setAdminPasswords();
