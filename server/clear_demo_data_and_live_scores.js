import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tournament from './models/Tournament.js';
import Match from './models/Match.js';
import Registration from './models/Registration.js';
import Notification from './models/Notification.js';
import Payment from './models/Payment.js';
import Comment from './models/Comment.js';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

async function clearDemoData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // 1. Find demo tournaments to remove
    const demoTournaments = await Tournament.find({
      $or: [
        { isTestData: true },
        { name: { $regex: /Goa Champions Football Cup|Goa Cricket Super League|Goa Badminton Open|Goa Monsoon Football League|South Goa Sports Championship|Goa Futsal Group Cup/i } }
      ]
    });

    const demoIds = demoTournaments.map(t => t._id);
    console.log(`Found ${demoTournaments.length} demo tournament(s) to remove:`);
    demoTournaments.forEach(t => console.log(` - ${t.name} (${t._id})`));

    // 2. Delete all matches for demo tournaments or marked isTestData: true or LIVE matches associated with demo
    const matchesDeleted = await Match.deleteMany({
      $or: [
        { tournament: { $in: demoIds } },
        { isTestData: true }
      ]
    });
    console.log(`Deleted ${matchesDeleted.deletedCount} demo match(es) and live score(s).`);

    // 3. Delete all registrations for demo tournaments or marked isTestData: true
    const regDeleted = await Registration.deleteMany({
      $or: [
        { tournament: { $in: demoIds } },
        { isTestData: true }
      ]
    });
    console.log(`Deleted ${regDeleted.deletedCount} demo registration(s).`);

    // 4. Delete all comments for demo tournaments or marked isTestData: true
    const commentsDeleted = await Comment.deleteMany({
      $or: [
        { tournament: { $in: demoIds } },
        { isTestData: true }
      ]
    });
    console.log(`Deleted ${commentsDeleted.deletedCount} demo comment(s).`);

    // 5. Delete all notifications marked isTestData: true or mentioning demo titles
    const notifDeleted = await Notification.deleteMany({
      $or: [
        { isTestData: true },
        { message: { $regex: /Goa Champions|Goa Cricket|Goa Badminton|Goa Monsoon|South Goa Sports/i } }
      ]
    });
    console.log(`Deleted ${notifDeleted.deletedCount} demo notification(s).`);

    // 6. Delete all payments marked isTestData: true or for demo tournaments
    const payDeleted = await Payment.deleteMany({
      $or: [
        { tournament: { $in: demoIds } },
        { isTestData: true }
      ]
    });
    console.log(`Deleted ${payDeleted.deletedCount} demo payment(s).`);

    // 7. Delete demo tournaments
    const tournDeleted = await Tournament.deleteMany({
      _id: { $in: demoIds }
    });
    console.log(`Deleted ${tournDeleted.deletedCount} demo tournament(s).`);

    // 8. Delete test user accounts (player01.test@..., organizer01.test@...)
    const usersDeleted = await User.deleteMany({
      $or: [
        { isTestData: true },
        { email: { $regex: /@goatournament\.com$/i } }
      ]
    });
    console.log(`Deleted ${usersDeleted.deletedCount} test user account(s).`);

    // 9. List remaining tournaments
    const remainingTournaments = await Tournament.find({}).sort({ createdAt: -1 });
    console.log(`\n====================================================`);
    console.log(`REMAINING REAL TOURNAMENTS IN DATABASE (${remainingTournaments.length}):`);
    remainingTournaments.forEach((t, i) => {
      console.log(`[${i + 1}] ID: ${t._id} | Name: "${t.name}" | Sport: ${t.sport} | Status: ${t.status}`);
    });

    // 10. List remaining live/scheduled matches
    const remainingMatches = await Match.find({});
    console.log(`REMAINING MATCHES IN DATABASE: ${remainingMatches.length}`);
    console.log(`====================================================`);

    process.exit(0);
  } catch (error) {
    console.error('Error clearing demo data:', error);
    process.exit(1);
  }
}

clearDemoData();
