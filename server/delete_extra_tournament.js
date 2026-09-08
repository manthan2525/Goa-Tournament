import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tournament from './models/Tournament.js';
import Registration from './models/Registration.js';
import Match from './models/Match.js';
import Comment from './models/Comment.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

async function deleteExtraTournament() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Find tournament named "Goa Futsal Group Cup 2026" or any extra futsal test tournament
    const extraTournaments = await Tournament.find({
      $or: [
        { name: 'Goa Futsal Group Cup 2026' },
        { _id: '6a9f97423f167138d4e9e719' }
      ]
    });

    console.log(`FOUND ${extraTournaments.length} EXTRA TOURNAMENT(S) TO DELETE`);

    for (const t of extraTournaments) {
      await Registration.deleteMany({ tournament: t._id });
      await Match.deleteMany({ tournament: t._id });
      await Comment.deleteMany({ tournament: t._id });
      await Tournament.findByIdAndDelete(t._id);
      console.log(`DELETED TOURNAMENT: "${t.name}" (${t._id})`);
    }

    const remaining = await Tournament.find({}).sort({ createdAt: -1 });
    console.log(`\nREMAINING TOURNAMENTS (${remaining.length}):`);
    remaining.forEach((t, i) => {
      console.log(`[${i + 1}] ID: ${t._id} | Name: "${t.name}" | Sport: ${t.sport}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteExtraTournament();
