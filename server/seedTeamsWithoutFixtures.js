import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Tournament from './models/Tournament.js';
import Registration from './models/Registration.js';
import Payment from './models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goa_tournament';

const TEAM_NAMES = [
  { team: 'Salcete Strikers FC', captain: 'Rohit Fernandes', phone: '+91 98221 11111' },
  { team: 'Panaji Warriors', captain: 'Aniket Naik', phone: '+91 98221 22222' },
  { team: 'Mapusa Eagles', captain: 'Siddhesh Parab', phone: '+91 98221 33333' },
  { team: 'Vasco Defenders', captain: 'Joshua D\'Souza', phone: '+91 98221 44444' },
  { team: 'Margao United', captain: 'Devendra Shirodkar', phone: '+91 98221 55555' },
  { team: 'Calangute Tigers', captain: 'Shane Rodrigues', phone: '+91 98221 66666' },
  { team: 'Ponda Champions', captain: 'Prathamesh Gaonkar', phone: '+91 98221 77777' },
  { team: 'Bardez United', captain: 'Aaron Silva', phone: '+91 98221 88888' },
  { team: 'Bicholim Strikers', captain: 'Kunal Sawant', phone: '+91 98221 99999' },
  { team: 'Curchorem Kings', captain: 'Nikhil Rane', phone: '+91 98221 00000' },
  { team: 'Tiswadi Heroes', captain: 'Gautam Kamat', phone: '+91 98221 12345' },
  { team: 'Mormugao Titans', captain: 'Dylan Pinto', phone: '+91 98221 54321' },
  { team: 'Sanguem Rovers', captain: 'Rahul Bhandari', phone: '+91 98221 67890' },
  { team: 'Quepem Panthers', captain: 'Vikram Phadte', phone: '+91 98221 98765' },
  { team: 'Pernem Royals', captain: 'Suraj Deshmukh', phone: '+91 98221 11223' },
  { team: 'Canacona Coastal FC', captain: 'Manuel Cardozo', phone: '+91 98221 44556' },
];

const seedTeamsWithoutFixtures = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find all tournaments
    const tournaments = await Tournament.find({});
    console.log(`Found ${tournaments.length} tournaments.`);

    if (tournaments.length === 0) {
      console.log('No tournaments found in database.');
      process.exit(0);
    }

    for (const t of tournaments) {
      console.log(`\nProcessing tournament: "${t.name}" (Max Teams: ${t.maxTeams})`);

      // Count existing verified registrations
      const existingRegs = await Registration.find({
        tournament: t._id,
        status: { $in: ['VERIFIED', 'APPROVED'] },
      });

      console.log(`Current verified registrations: ${existingRegs.length}`);

      const targetCount = t.maxTeams || 8;
      const neededCount = Math.max(0, targetCount - existingRegs.length);

      if (neededCount === 0) {
        console.log(`Tournament already has full required teams (${existingRegs.length}/${targetCount}).`);
        continue;
      }

      console.log(`Adding ${neededCount} teams to reach full capacity of ${targetCount}...`);

      for (let i = 0; i < neededCount; i++) {
        const teamIndex = existingRegs.length + i;
        const teamInfo = TEAM_NAMES[teamIndex % TEAM_NAMES.length];
        const uniqueTeamName = `${teamInfo.team} #${teamIndex + 1}`;

        // Create or find a unique dummy player user to satisfy compound index { tournament: 1, user: 1 }
        const dummyEmail = `team_player_${t._id.toString().slice(-4)}_${teamIndex + 1}@goatournament.com`;
        let playerUser = await User.findOne({ email: dummyEmail });
        if (!playerUser) {
          playerUser = new User({
            name: teamInfo.captain,
            email: dummyEmail,
            password: 'PlayerPassword@2026',
            phone: teamInfo.phone,
            whatsapp: teamInfo.phone,
            role: 'PLAYER',
            isTestData: true,
          });
          await playerUser.save();
        }

        const reg = await Registration.create({
          tournament: t._id,
          user: playerUser._id,
          teamName: uniqueTeamName,
          captainName: teamInfo.captain,
          contactPhone: teamInfo.phone,
          contactEmail: dummyEmail,
          contactWhatsapp: teamInfo.phone,
          playersList: [
            { name: teamInfo.captain, jerseyNumber: '10', role: 'Captain' },
            { name: 'Player A', jerseyNumber: '7', role: 'Forward' },
            { name: 'Player B', jerseyNumber: '4', role: 'Defender' },
            { name: 'Player C', jerseyNumber: '1', role: 'Goalkeeper' },
          ],
          paymentStatus: 'VERIFIED',
          aadhaarVerificationStatus: 'VERIFIED',
          status: 'VERIFIED',
          isTestData: true,
        });

        // Create verified payment record
        await Payment.create({
          registration: reg._id,
          tournament: t._id,
          user: playerUser._id,
          amount: t.registrationFee || 0,
          transactionId: `UTR${Date.now()}${i}`,
          screenshotUrl: 'https://images.unsplash.com/photo-1556742049-0a67daf4005a?auto=format&fit=crop&w=400&q=80',
          status: 'VERIFIED',
          isTestData: true,
        });
      }

      // Update tournament's registered teams count
      const finalCount = await Registration.countDocuments({
        tournament: t._id,
        status: { $in: ['VERIFIED', 'APPROVED'] },
      });

      t.registeredTeamsCount = finalCount;
      if (t.status !== 'COMPLETED' && t.status !== 'ONGOING') {
        t.status = 'REGISTRATION_CLOSED';
      }
      await t.save();

      console.log(`Successfully filled "${t.name}" with ${finalCount} verified teams! (No fixtures created)`);
    }

    console.log('\n✅ Seed completed: All tournaments now have full required teams with NO fixtures created.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding teams:', err);
    process.exit(1);
  }
};

seedTeamsWithoutFixtures();
