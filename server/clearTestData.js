import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Tournament from './models/Tournament.js';
import Match from './models/Match.js';
import Registration from './models/Registration.js';
import Notification from './models/Notification.js';
import Payment from './models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

const clearTestData = async () => {
  try {
    console.log('Connecting to MongoDB for test data cleanup...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Delete ONLY items where isTestData is true
    const deletedUsers = await User.deleteMany({ isTestData: true });
    const deletedTournaments = await Tournament.deleteMany({ isTestData: true });
    const deletedMatches = await Match.deleteMany({ isTestData: true });
    const deletedRegistrations = await Registration.deleteMany({ isTestData: true });
    const deletedNotifications = await Notification.deleteMany({ isTestData: true });
    const deletedPayments = await Payment.deleteMany({ isTestData: true });

    console.log('====================================================');
    console.log('TEST DATA CLEANUP SUMMARY:');
    console.log(`- Test Users Removed: ${deletedUsers.deletedCount}`);
    console.log(`- Test Tournaments Removed: ${deletedTournaments.deletedCount}`);
    console.log(`- Test Matches Removed: ${deletedMatches.deletedCount}`);
    console.log(`- Test Registrations Removed: ${deletedRegistrations.deletedCount}`);
    console.log(`- Test Notifications Removed: ${deletedNotifications.deletedCount}`);
    console.log(`- Test Payments Removed: ${deletedPayments.deletedCount}`);
    console.log('Real users, real organizers, and real admin accounts remain untouched.');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Clear test data error:', error);
    process.exit(1);
  }
};

clearTestData();
