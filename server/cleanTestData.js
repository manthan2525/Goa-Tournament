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
import Standings from './models/Standings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

const cleanTestData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Delete test tournaments & get their IDs
    const testTournaments = await Tournament.find({
      $or: [
        { isTestData: true },
        { name: { $regex: /test/i } },
        { name: { $in: ['Goa Champions Football Cup 2026', 'Goa Cricket Super League 2026', 'Goa Badminton Open 2026', 'Goa Monsoon Football League 2026', 'South Goa Sports Championship 2026', 'Goa Futsal Group Cup 2026'] } },
      ],
    });
    const testTournIds = testTournaments.map((t) => t._id);

    const deletedTournResult = await Tournament.deleteMany({ _id: { $in: testTournIds } });
    console.log(`Deleted ${deletedTournResult.deletedCount} test tournament(s).`);

    // 2. Delete test users & get their IDs
    const testUsers = await User.find({
      $or: [
        { isTestData: true },
        { email: { $regex: /@goatournament\.com$/i } },
        { email: { $regex: /\.test@/i } },
      ],
    });
    const testUserIds = testUsers.map((u) => u._id);

    const deletedUsersResult = await User.deleteMany({ _id: { $in: testUserIds } });
    console.log(`Deleted ${deletedUsersResult.deletedCount} test user account(s).`);

    // 3. Delete test registrations
    const deletedRegsResult = await Registration.deleteMany({
      $or: [
        { isTestData: true },
        { tournament: { $in: testTournIds } },
        { user: { $in: testUserIds } },
      ],
    });
    console.log(`Deleted ${deletedRegsResult.deletedCount} test registration(s).`);

    // 4. Delete test matches
    const deletedMatchesResult = await Match.deleteMany({
      $or: [
        { isTestData: true },
        { tournament: { $in: testTournIds } },
      ],
    });
    console.log(`Deleted ${deletedMatchesResult.deletedCount} test match(es).`);

    // 5. Delete test notifications
    const deletedNotifsResult = await Notification.deleteMany({
      $or: [
        { isTestData: true },
        { recipient: { $in: testUserIds } },
        { sender: { $in: testUserIds } },
      ],
    });
    console.log(`Deleted ${deletedNotifsResult.deletedCount} test notification(s).`);

    // 6. Delete test payments
    const deletedPaymentsResult = await Payment.deleteMany({
      $or: [
        { isTestData: true },
        { tournament: { $in: testTournIds } },
        { user: { $in: testUserIds } },
      ],
    });
    console.log(`Deleted ${deletedPaymentsResult.deletedCount} test payment(s).`);

    // 7. Delete test standings
    const deletedStandingsResult = await Standings.deleteMany({
      $or: [
        { isTestData: true },
        { tournament: { $in: testTournIds } },
      ],
    });
    console.log(`Deleted ${deletedStandingsResult.deletedCount} test standing(s).`);

    console.log('====================================================');
    console.log('ALL TEST DATA WAS REMOVED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Clean test data error:', error);
    process.exit(1);
  }
};

cleanTestData();
