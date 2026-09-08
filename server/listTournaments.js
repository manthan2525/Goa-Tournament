import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tournament from './models/Tournament.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

async function listTournaments() {
  try {
    await mongoose.connect(MONGO_URI);
    const tournaments = await Tournament.find({}).sort({ createdAt: -1 });
    console.log(`TOTAL TOURNAMENTS IN DB: ${tournaments.length}`);
    tournaments.forEach((t, i) => {
      console.log(`[${i + 1}] ID: ${t._id} | Name: "${t.name}" | Sport: ${t.sport} | Format: ${t.format} | Created: ${t.createdAt} | isTestData: ${t.isTestData}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listTournaments();
