import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Match from '../models/Match.js';
import Standings from '../models/Standings.js';
import {
  generateKnockoutFixtures,
  generateRoundRobinFixtures,
} from './fixtureGenerator.js';

dotenv.config();

const sampleQrCode =
  'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=goasports@upi&pn=Goa%20Sports%20Council&am=500&cu=INR';

const sampleReceipt =
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';

export const checkAndSeedData = async () => {
  try {
    const count = await Tournament.countDocuments();
    if (count === 0) {
      console.log('[Seed] Database is empty. Running initial tournament seed...');
      await seedDatabase(false);
    }
  } catch (err) {
    console.error('[Seed Check Error]', err.message);
  }
};

const seedDatabase = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('[Seed] Populating collections...');
    await User.deleteMany({});
    await Tournament.deleteMany({});
    await Registration.deleteMany({});
    await Payment.deleteMany({});
    await Match.deleteMany({});
    await Standings.deleteMany({});

    console.log('[Seed] Creating demo users...');

    // 1. Organizers
    const gfaOrganizer = await User.create({
      name: 'Goa Football Association (GFA)',
      email: 'organizer@gfa.com',
      password: 'password123',
      phone: '+91 98221 45678',
      role: 'ORGANIZER',
      organizationName: 'Goa Football Association',
      location: 'Panaji, Goa',
      bio: 'Official governing body for competitive association football in Goa.',
    });

    const cricketOrganizer = await User.create({
      name: 'Goa Cricket Council',
      email: 'organizer@cricket.com',
      password: 'password123',
      phone: '+91 98222 11223',
      role: 'ORGANIZER',
      organizationName: 'Goa Premier Sports Trust',
      location: 'Mapusa, Goa',
      bio: 'Organizing professional & grassroot cricket tournaments across North & South Goa.',
    });

    // 2. Players / Captains
    const demoPlayer = await User.create({
      name: 'Rohit Fernandes',
      email: 'player@goa.com',
      password: 'password123',
      phone: '+91 98233 44556',
      role: 'PLAYER',
      location: 'Margao, Goa',
      bio: 'Captain & Forward for Salcete Strikers FC. Passionate football & badminton enthusiast.',
    });

    const teamCaptains = [
      { name: 'Antonio Da Silva', email: 'antonio@goa.com', team: 'Salcete Strikers' },
      { name: 'Vikram Naik', email: 'vikram@goa.com', team: 'Panaji Panthers' },
      { name: 'Shawn Dsouza', email: 'shawn@goa.com', team: 'Mapusa Mavericks' },
      { name: 'Nikhil Kamat', email: 'nikhil@goa.com', team: 'Vasco Voyagers' },
      { name: 'Clinton Pereira', email: 'clinton@goa.com', team: 'Calangute Crusaders' },
      { name: 'Gaurav Sawant', email: 'gaurav@goa.com', team: 'Margao Monarchs' },
      { name: 'Ashwin Prabhu', email: 'ashwin@goa.com', team: 'Ponda Pioneers' },
      { name: 'Joshua Rebello', email: 'joshua@goa.com', team: 'Bicholim Blasters' },
    ];

    const playerUsers = [demoPlayer];
    for (let i = 1; i < teamCaptains.length; i++) {
      const cap = teamCaptains[i];
      const u = await User.create({
        name: cap.name,
        email: cap.email,
        password: 'password123',
        phone: `+91 98230 ${10000 + i}`,
        role: 'PLAYER',
        location: 'Goa, India',
      });
      playerUsers.push(u);
    }

    console.log('[Seed] Creating Tournaments in Goa...');

    // Tournament 1: Football Knockout (Live & Ongoing)
    const footballTournament = await Tournament.create({
      name: 'Goa Super Cup Football Championship 2026',
      sport: 'Football',
      organizer: gfaOrganizer._id,
      venue: 'Tilak Maidan Stadium',
      location: 'Vasco da Gama',
      startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      registrationFee: 1500,
      upiId: 'gfa.tournaments@okaxis',
      qrCode: sampleQrCode,
      format: 'KNOCKOUT',
      maxTeams: 8,
      teamSize: 11,
      prizePool: '1st Prize: ₹50,000 | 2nd Prize: ₹25,000 | Best Player: ₹5,000',
      rules: 'Standard FIFA rules. 45-minute halves with direct penalties in knockout if tied.',
      description:
        'The premier inter-village and club championship in Goa featuring 8 elite squads competing for the prestigious Goa Super Cup trophy.',
      bannerImage:
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      status: 'ONGOING',
      registeredTeamsCount: 8,
    });

    // Tournament 2: Cricket Round Robin (Open for Registration)
    const cricketTournament = await Tournament.create({
      name: 'Mandovi Premier T20 Cricket League',
      sport: 'Cricket',
      organizer: cricketOrganizer._id,
      venue: 'Peddem Sports Complex',
      location: 'Mapusa',
      startDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      registrationFee: 2500,
      upiId: 'goacricket@upi',
      qrCode: sampleQrCode,
      format: 'ROUND_ROBIN',
      maxTeams: 6,
      teamSize: 11,
      prizePool: 'Champion: ₹1,00,000 + Trophy | Runner-Up: ₹50,000',
      rules: '20 overs per side. White leather ball. ICC standard T20 rules with 5 bowler restriction.',
      description:
        'Exciting high-octane 20-over cricket tournament under the floodlights at Peddem Stadium Mapusa.',
      bannerImage:
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      status: 'REGISTRATION_OPEN',
      registeredTeamsCount: 2,
    });

    // Tournament 3: Badminton Championship (Panaji)
    await Tournament.create({
      name: 'All Goa Open Badminton Masters 2026',
      sport: 'Badminton',
      organizer: gfaOrganizer._id,
      venue: 'Campal Indoor Sports Complex',
      location: 'Panaji',
      startDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      registrationFee: 800,
      upiId: 'panajibadminton@upi',
      qrCode: sampleQrCode,
      format: 'KNOCKOUT',
      maxTeams: 16,
      teamSize: 2,
      prizePool: '1st: ₹20,000 | 2nd: ₹10,000',
      rules: 'BWF standard scoring (Best of 3 sets, 21 points per set, feather shuttlecocks provided).',
      description: 'Men & Women Doubles Open Championship on professional wooden court flooring.',
      bannerImage:
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      status: 'REGISTRATION_OPEN',
      registeredTeamsCount: 4,
    });

    // Tournament 4: Kabaddi Championship (Margao)
    await Tournament.create({
      name: 'Salcete Pro Kabaddi Trophy',
      sport: 'Kabaddi',
      organizer: gfaOrganizer._id,
      venue: 'Fatorda Multi-purpose Stadium',
      location: 'Margao',
      startDate: new Date(Date.now() + 18 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
      registrationFee: 1200,
      upiId: 'salcetekabaddi@upi',
      qrCode: sampleQrCode,
      format: 'GROUP_KNOCKOUT',
      maxTeams: 8,
      teamSize: 7,
      prizePool: 'Winners: ₹35,000 | Runners: ₹15,000',
      rules: 'Standard Pro Kabaddi mat rules (20 min halves, 30s raid clock, Do-or-Die raids).',
      description: 'High intensity Kabaddi clash of village powerhouse teams across South Goa.',
      bannerImage:
        'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
      status: 'REGISTRATION_OPEN',
      registeredTeamsCount: 0,
    });

    console.log('[Seed] Registering teams and payments for Football Super Cup...');

    const verifiedFootballRegistrations = [];

    for (let i = 0; i < teamCaptains.length; i++) {
      const cap = teamCaptains[i];
      const user = playerUsers[i];

      const reg = await Registration.create({
        tournament: footballTournament._id,
        user: user._id,
        teamName: cap.team,
        captainName: cap.name,
        contactPhone: user.phone,
        contactEmail: user.email,
        playersList: [
          { name: cap.name, jerseyNumber: 10, role: 'Forward' },
          { name: 'Player Two', jerseyNumber: 7, role: 'Midfielder' },
          { name: 'Player Three', jerseyNumber: 4, role: 'Defender' },
          { name: 'Player Four', jerseyNumber: 1, role: 'Goalkeeper' },
        ],
        status: 'VERIFIED',
      });

      const payment = await Payment.create({
        user: user._id,
        tournament: footballTournament._id,
        registration: reg._id,
        amount: 1500,
        screenshotUrl: sampleReceipt,
        transactionId: `UPI2026GOA00${1000 + i}`,
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: gfaOrganizer._id,
      });

      reg.payment = payment._id;
      await reg.save();

      verifiedFootballRegistrations.push(reg);
    }

    // Pending registration on Cricket tournament for demoPlayer
    const pendingCricketReg = await Registration.create({
      tournament: cricketTournament._id,
      user: demoPlayer._id,
      teamName: 'Salcete Cricket Titans',
      captainName: demoPlayer.name,
      contactPhone: demoPlayer.phone,
      contactEmail: demoPlayer.email,
      playersList: [{ name: demoPlayer.name, jerseyNumber: 18, role: 'All-Rounder' }],
      status: 'PENDING',
    });

    const pendingPayment = await Payment.create({
      user: demoPlayer._id,
      tournament: cricketTournament._id,
      registration: pendingCricketReg._id,
      amount: 2500,
      screenshotUrl: sampleReceipt,
      transactionId: 'UPI992837482019',
      status: 'PENDING',
    });

    pendingCricketReg.payment = pendingPayment._id;
    await pendingCricketReg.save();

    console.log('[Seed] Generating Knockout Fixtures for Football Super Cup...');

    const fixtures = generateKnockoutFixtures(
      footballTournament._id,
      verifiedFootballRegistrations,
      footballTournament.startDate
    );

    // QF1 - Completed
    fixtures[0].status = 'COMPLETED';
    fixtures[0].scoreA = { current: 3, display: '3', detail: { goals: ['12m Rohit Fernandes', '44m Rohit Fernandes', '88m Shawn'] } };
    fixtures[0].scoreB = { current: 1, display: '1', detail: { goals: ['55m Nikhil'] } };
    fixtures[0].winner = fixtures[0].teamA;
    fixtures[0].summary = `${fixtures[0].teamA.name} won 3 - 1 in regular time`;

    // QF2 - Completed
    fixtures[1].status = 'COMPLETED';
    fixtures[1].scoreA = { current: 0, display: '0', detail: {} };
    fixtures[1].scoreB = { current: 2, display: '2', detail: { goals: ['30m Gaurav', '72m Gaurav'] } };
    fixtures[1].winner = fixtures[1].teamB;
    fixtures[1].summary = `${fixtures[1].teamB.name} advanced with a clean sheet`;

    // Semi-Final 1 (Match 5) - LIVE match!
    fixtures[4].teamA = fixtures[0].winner;
    fixtures[4].teamB = fixtures[1].winner;
    fixtures[4].status = 'LIVE';
    fixtures[4].scoreA = { current: 2, display: '2', detail: { goals: ['14m Rohit', '60m Shawn'] } };
    fixtures[4].scoreB = { current: 1, display: '1', detail: { goals: ['48m Gaurav'] } };
    fixtures[4].summary = 'LIVE: 75th Minute - Thrilling clash underway at Tilak Maidan!';

    // QF3 - Completed
    fixtures[2].status = 'COMPLETED';
    fixtures[2].scoreA = { current: 1, display: '1', detail: {} };
    fixtures[2].scoreB = { current: 0, display: '0', detail: {} };
    fixtures[2].winner = fixtures[2].teamA;

    // QF4 - Completed
    fixtures[3].status = 'COMPLETED';
    fixtures[3].scoreA = { current: 2, display: '2', detail: {} };
    fixtures[3].scoreB = { current: 3, display: '3', detail: {} };
    fixtures[3].winner = fixtures[3].teamB;

    // Semi-Final 2 (Match 6)
    fixtures[5].teamA = fixtures[2].winner;
    fixtures[5].teamB = fixtures[3].winner;
    fixtures[5].status = 'SCHEDULED';

    await Match.insertMany(fixtures);

    console.log('[Seed] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Organizer: organizer@gfa.com | password: password123');
    console.log('Demo Player:    player@goa.com    | password: password123');
    console.log('----------------------------------------------------');

    if (exitOnComplete) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]', error);
    if (exitOnComplete) {
      process.exit(1);
    }
  }
};

// Auto run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(true);
}
