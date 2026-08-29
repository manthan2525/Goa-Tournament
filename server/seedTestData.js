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

const playerUsers = [
  { name: 'Goa Test Player 01', email: 'player01.test@goatournament.com', password: 'Player01@2026', phone: '+91 9000000001', whatsapp: '+91 9000000001', role: 'PLAYER' },
  { name: 'Goa Test Player 02', email: 'player02.test@goatournament.com', password: 'Player02@2026', phone: '+91 9000000002', whatsapp: '+91 9000000002', role: 'PLAYER' },
  { name: 'Goa Test Player 03', email: 'player03.test@goatournament.com', password: 'Player03@2026', phone: '+91 9000000003', whatsapp: '+91 9000000003', role: 'PLAYER' },
  { name: 'Goa Test Player 04', email: 'player04.test@goatournament.com', password: 'Player04@2026', phone: '+91 9000000004', whatsapp: '+91 9000000004', role: 'PLAYER' },
  { name: 'Goa Test Player 05', email: 'player05.test@goatournament.com', password: 'Player05@2026', phone: '+91 9000000005', whatsapp: '+91 9000000005', role: 'PLAYER' },
  { name: 'Goa Test Player 06', email: 'player06.test@goatournament.com', password: 'Player06@2026', phone: '+91 9000000006', whatsapp: '+91 9000000006', role: 'PLAYER' },
  { name: 'Goa Test Player 07', email: 'player07.test@goatournament.com', password: 'Player07@2026', phone: '+91 9000000007', whatsapp: '+91 9000000007', role: 'PLAYER' },
  { name: 'Goa Test Player 08', email: 'player08.test@goatournament.com', password: 'Player08@2026', phone: '+91 9000000008', whatsapp: '+91 9000000008', role: 'PLAYER' },
];

const organizerUsers = [
  { name: 'Goa Test Organizer 01', email: 'organizer01.test@goatournament.com', password: 'Organizer01@2026', phone: '+91 9000000011', whatsapp: '+91 9000000011', role: 'ORGANIZER', organizationName: 'Goa Football Association' },
  { name: 'Goa Test Organizer 02', email: 'organizer02.test@goatournament.com', password: 'Organizer02@2026', phone: '+91 9000000012', whatsapp: '+91 9000000012', role: 'ORGANIZER', organizationName: 'Goa Cricket Academy' },
  { name: 'Goa Test Organizer 03', email: 'organizer03.test@goatournament.com', password: 'Organizer03@2026', phone: '+91 9000000013', whatsapp: '+91 9000000013', role: 'ORGANIZER', organizationName: 'Mapusa Sports Club' },
  { name: 'Goa Test Organizer 04', email: 'organizer04.test@goatournament.com', password: 'Organizer04@2026', phone: '+91 9000000014', whatsapp: '+91 9000000014', role: 'ORGANIZER', organizationName: 'South Goa Youth Club' },
  { name: 'Goa Test Organizer 05', email: 'organizer05.test@goatournament.com', password: 'Organizer05@2026', phone: '+91 9000000015', whatsapp: '+91 9000000015', role: 'ORGANIZER', organizationName: 'Panjim Sports Council' },
];

const seedTestData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Seed Accounts (Idempotent)
    const seededPlayers = [];
    for (const p of playerUsers) {
      let user = await User.findOne({ email: p.email });
      if (!user) {
        user = new User({ ...p, isTestData: true });
        await user.save();
        console.log(`Created player: ${p.email}`);
      } else {
        user.name = p.name;
        user.phone = p.phone;
        user.whatsapp = p.whatsapp;
        user.role = p.role;
        user.isTestData = true;
        user.password = p.password;
        await user.save();
        console.log(`Updated player: ${p.email}`);
      }
      seededPlayers.push(user);
    }

    const seededOrganizers = [];
    for (const o of organizerUsers) {
      let user = await User.findOne({ email: o.email });
      if (!user) {
        user = new User({ ...o, isTestData: true });
        await user.save();
        console.log(`Created organizer: ${o.email}`);
      } else {
        user.name = o.name;
        user.phone = o.phone;
        user.whatsapp = o.whatsapp;
        user.role = o.role;
        user.organizationName = o.organizationName;
        user.isTestData = true;
        user.password = o.password;
        await user.save();
        console.log(`Updated organizer: ${o.email}`);
      }
      seededOrganizers.push(user);
    }

    // 2. Seed Tournaments
    const tournamentsDef = [
      {
        name: 'Goa Champions Football Cup 2026',
        sport: 'Football',
        organizer: seededOrganizers[0]._id,
        description: 'Premier Knockout Football Tournament in Margao featuring top Goa clubs.',
        venue: 'Fatorda Stadium',
        location: { address: 'Fatorda Stadium, Margao, Goa', latitude: 15.2831, longitude: 73.9678 },
        startDate: new Date('2026-08-20'),
        endDate: new Date('2026-08-30'),
        registrationFee: 500,
        upiId: 'goafootball@upi',
        format: 'KNOCKOUT',
        maxTeams: 8,
        status: 'ONGOING',
        requireAadhaarVerification: true,
        bannerImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        registeredTeamsCount: 8,
        isTestData: true,
      },
      {
        name: 'Goa Cricket Super League 2026',
        sport: 'Cricket',
        organizer: seededOrganizers[1]._id,
        description: 'T20 Night Cricket Championship under floodlights at Arlem Stadium.',
        venue: 'Arlem Cricket Ground',
        location: { address: 'Arlem Cricket Stadium, Margao, Goa', latitude: 15.2954, longitude: 73.9723 },
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-10'),
        registrationFee: 1000,
        upiId: 'goacricket@upi',
        format: 'KNOCKOUT',
        maxTeams: 6,
        status: 'UPCOMING',
        requireAadhaarVerification: false,
        bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
        registeredTeamsCount: 4,
        isTestData: true,
      },
      {
        name: 'Goa Badminton Open 2026',
        sport: 'Badminton',
        organizer: seededOrganizers[2]._id,
        description: 'State Level Open Badminton Singles & Doubles Tournament.',
        venue: 'Peddem Sports Complex',
        location: { address: 'Peddem Indoor Complex, Mapusa, Goa', latitude: 15.6022, longitude: 73.8189 },
        startDate: new Date('2026-09-15'),
        endDate: new Date('2026-09-18'),
        registrationFee: 300,
        upiId: 'goabadminton@upi',
        format: 'KNOCKOUT',
        maxTeams: 16,
        status: 'UPCOMING',
        requireAadhaarVerification: false,
        bannerImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        registeredTeamsCount: 6,
        isTestData: true,
      },
      {
        name: 'Goa Monsoon Football League 2026',
        sport: 'Football',
        organizer: seededOrganizers[3]._id,
        description: 'Monsoon Football Championship completed in Vasco.',
        venue: 'Tilak Maidan',
        location: { address: 'Tilak Maidan Stadium, Vasco da Gama, Goa', latitude: 15.3981, longitude: 73.8114 },
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-15'),
        registrationFee: 400,
        upiId: 'vascofootball@upi',
        format: 'KNOCKOUT',
        maxTeams: 8,
        status: 'COMPLETED',
        winner: 'Goa Warriors',
        runnerUp: 'Vasco Strikers',
        thirdPlace: 'Panjim FC',
        requireAadhaarVerification: true,
        bannerImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        registeredTeamsCount: 8,
        isTestData: true,
      },
      {
        name: 'South Goa Sports Championship 2026',
        sport: 'Football',
        organizer: seededOrganizers[4]._id,
        description: 'Inter-village multi-sports tournament in Curtorim.',
        venue: 'SAG Sports Complex',
        location: { address: 'SAG Sports Complex, Curtorim, Goa', latitude: 15.2917, longitude: 74.0152 },
        startDate: new Date('2026-09-20'),
        endDate: new Date('2026-09-25'),
        registrationFee: 0,
        format: 'KNOCKOUT',
        maxTeams: 16,
        status: 'REGISTRATION_OPEN',
        requireAadhaarVerification: false,
        bannerImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        registeredTeamsCount: 5,
        isTestData: true,
      },
      {
        name: 'Goa Futsal Group Cup 2026',
        sport: 'Futsal',
        organizer: seededOrganizers[0]._id,
        description: 'Group Stage + Knockout Finals Futsal Tournament in Panaji featuring 8 teams in Group A & Group B.',
        venue: 'Panaji Indoor Turf Arena',
        location: { address: 'Panaji Indoor Stadium, Panaji, Goa', latitude: 15.4989, longitude: 73.8278 },
        startDate: new Date('2026-09-05'),
        endDate: new Date('2026-09-12'),
        registrationFee: 450,
        upiId: 'goafutsal@upi',
        format: 'GROUP_KNOCKOUT',
        numberOfGroups: 2,
        maxTeams: 8,
        status: 'REGISTRATION_OPEN',
        requireAadhaarVerification: false,
        bannerImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        registeredTeamsCount: 8,
        isTestData: true,
      },
    ];

    const seededTournaments = [];
    for (const tDef of tournamentsDef) {
      let tournament = await Tournament.findOne({ name: tDef.name });
      if (!tournament) {
        tournament = new Tournament(tDef);
        await tournament.save();
        console.log(`Created tournament: ${tDef.name}`);
      } else {
        Object.assign(tournament, tDef);
        await tournament.save();
        console.log(`Updated tournament: ${tDef.name}`);
      }
      seededTournaments.push(tournament);
    }

    // 3. Seed Registrations
    const regDefs = [
      {
        tournament: seededTournaments[0]._id, // Goa Champions Football Cup
        user: seededPlayers[0]._id,
        teamName: 'Goa Warriors',
        captainName: 'Goa Test Player 01',
        contactPhone: '+91 9000000001',
        contactEmail: 'player01.test@goatournament.com',
        contactWhatsapp: '+91 9000000001',
        playersList: [
          { name: 'Goa Test Player 01', role: 'Captain', jerseyNumber: 10 },
          { name: 'Sanket Naik', role: 'Forward', jerseyNumber: 7 },
          { name: 'Rohan Shirodkar', role: 'Midfielder', jerseyNumber: 8 },
          { name: 'Kunal Silva', role: 'Defender', jerseyNumber: 4 },
        ],
        status: 'APPROVED',
        paymentStatus: 'VERIFIED',
        aadhaarVerificationStatus: 'VERIFIED',
        isTestData: true,
      },
      {
        tournament: seededTournaments[0]._id,
        user: seededPlayers[1]._id,
        teamName: 'Margao United',
        captainName: 'Goa Test Player 02',
        contactPhone: '+91 9000000002',
        contactEmail: 'player02.test@goatournament.com',
        contactWhatsapp: '+91 9000000002',
        playersList: [
          { name: 'Goa Test Player 02', role: 'Captain', jerseyNumber: 9 },
          { name: 'Vikram Faria', role: 'Goalkeeper', jerseyNumber: 1 },
          { name: 'Aaron D’Souza', role: 'Defender', jerseyNumber: 3 },
        ],
        status: 'APPROVED',
        paymentStatus: 'VERIFIED',
        aadhaarVerificationStatus: 'VERIFIED',
        isTestData: true,
      },
      {
        tournament: seededTournaments[1]._id, // Cricket
        user: seededPlayers[2]._id,
        teamName: 'Salcete Cricketers',
        captainName: 'Goa Test Player 03',
        contactPhone: '+91 9000000003',
        contactEmail: 'player03.test@goatournament.com',
        contactWhatsapp: '+91 9000000003',
        playersList: [
          { name: 'Goa Test Player 03', role: 'Captain', jerseyNumber: 18 },
          { name: 'Prathamesh Borkar', role: 'All-Rounder', jerseyNumber: 12 },
        ],
        status: 'PENDING',
        paymentStatus: 'PENDING',
        aadhaarVerificationStatus: 'NOT_REQUIRED',
        isTestData: true,
      },
      {
        tournament: seededTournaments[2]._id, // Badminton
        user: seededPlayers[3]._id,
        teamName: 'Mapusa Smashers',
        captainName: 'Goa Test Player 04',
        contactPhone: '+91 9000000004',
        contactEmail: 'player04.test@goatournament.com',
        contactWhatsapp: '+91 9000000004',
        playersList: [{ name: 'Goa Test Player 04', role: 'Singles Player', jerseyNumber: 1 }],
        status: 'APPROVED',
        paymentStatus: 'VERIFIED',
        aadhaarVerificationStatus: 'NOT_REQUIRED',
        isTestData: true,
      },
      {
        tournament: seededTournaments[3]._id, // Completed Football
        user: seededPlayers[4]._id,
        teamName: 'Panjim FC',
        captainName: 'Goa Test Player 05',
        contactPhone: '+91 9000000005',
        contactEmail: 'player05.test@goatournament.com',
        contactWhatsapp: '+91 9000000005',
        playersList: [{ name: 'Goa Test Player 05', role: 'Captain', jerseyNumber: 10 }],
        status: 'APPROVED',
        paymentStatus: 'VERIFIED',
        aadhaarVerificationStatus: 'VERIFIED',
        isTestData: true,
      },
    ];

    // Futsal Group Cup (seededTournaments[5]) 8 Teams Registration
    const futsalTeams = [
      { name: 'Goa Warriors', group: 'Group A' },
      { name: 'Margao United', group: 'Group A' },
      { name: 'Panjim FC', group: 'Group A' },
      { name: 'Vasco Strikers', group: 'Group A' },
      { name: 'Salcete Futsal', group: 'Group B' },
      { name: 'Mapusa Smashers', group: 'Group B' },
      { name: 'Calangute Beach Boys', group: 'Group B' },
      { name: 'Ponda Lions', group: 'Group B' },
    ];

    const futsalGroupAssignments = [];
    const futsalTourn = seededTournaments[5];

    for (let i = 0; i < futsalTeams.length; i++) {
      const fTeam = futsalTeams[i];
      const playerUser = seededPlayers[i % seededPlayers.length];
      let reg = await Registration.findOne({ tournament: futsalTourn._id, user: playerUser._id });
      if (!reg) {
        reg = new Registration({
          tournament: futsalTourn._id,
          user: playerUser._id,
          teamName: fTeam.name,
          captainName: playerUser.name,
          contactPhone: playerUser.phone,
          contactEmail: playerUser.email,
          contactWhatsapp: playerUser.whatsapp,
          assignedGroup: fTeam.group,
          status: 'APPROVED',
          paymentStatus: 'VERIFIED',
          isTestData: true,
          playersList: [
            { name: `${fTeam.name} Player 1`, role: 'Captain', jerseyNumber: 10 },
            { name: `${fTeam.name} Player 2`, role: 'Forward', jerseyNumber: 7 },
          ],
        });
        await reg.save();
      } else {
        reg.assignedGroup = fTeam.group;
        reg.status = 'APPROVED';
        await reg.save();
      }

      futsalGroupAssignments.push({
        groupName: fTeam.group,
        teamRegistrationId: reg._id,
        teamName: fTeam.name,
      });
    }

    futsalTourn.groupAssignments = futsalGroupAssignments;
    await futsalTourn.save();
    console.log('Saved 8 team registrations & group assignments for Goa Futsal Group Cup 2026.');

    for (const rDef of regDefs) {
      let reg = await Registration.findOne({ tournament: rDef.tournament, user: rDef.user });
      if (!reg) {
        reg = new Registration(rDef);
        await reg.save();
        console.log(`Created registration for ${rDef.teamName}`);
      } else {
        Object.assign(reg, rDef);
        await reg.save();
        console.log(`Updated registration for ${rDef.teamName}`);
      }
    }

    // 4. Seed Fixtures & Matches for Tournament 1 (Live Football)
    const t1 = seededTournaments[0];
    await Match.deleteMany({ tournament: t1._id, isTestData: true });

    const matchesDef = [
      {
        tournament: t1._id,
        round: 'Quarter Final 1',
        roundIndex: 1,
        matchNumber: 1,
        teamA: { name: 'Goa Warriors' },
        teamB: { name: 'Vasco Strikers' },
        scoreA: { current: 3, display: '3' },
        scoreB: { current: 1, display: '1' },
        status: 'COMPLETED',
        winner: { name: 'Goa Warriors' },
        startTime: new Date('2026-08-20T10:00:00Z'),
        venueCourt: 'Fatorda Main Pitch',
        summary: 'Goa Warriors won 3-1 in QF1',
        isTestData: true,
      },
      {
        tournament: t1._id,
        round: 'Quarter Final 2',
        roundIndex: 1,
        matchNumber: 2,
        teamA: { name: 'Margao United' },
        teamB: { name: 'Panjim FC' },
        scoreA: { current: 2, display: '2' },
        scoreB: { current: 0, display: '0' },
        status: 'COMPLETED',
        winner: { name: 'Margao United' },
        startTime: new Date('2026-08-21T14:00:00Z'),
        venueCourt: 'Fatorda Main Pitch',
        summary: 'Margao United won 2-0 in QF2',
        isTestData: true,
      },
      {
        tournament: t1._id,
        round: 'Semi Final 1',
        roundIndex: 2,
        matchNumber: 3,
        teamA: { name: 'Goa Warriors' },
        teamB: { name: 'Margao United' },
        scoreA: { current: 2, display: '2' },
        scoreB: { current: 1, display: '1' },
        status: 'LIVE',
        startTime: new Date(),
        venueCourt: 'Fatorda Stadium Ground 1',
        summary: 'LIVE 68\' — Goa Warriors leading 2-1 against Margao United',
        isTestData: true,
      },
      {
        tournament: t1._id,
        round: 'Final',
        roundIndex: 3,
        matchNumber: 4,
        teamA: { name: 'TBD' },
        teamB: { name: 'TBD' },
        scoreA: { current: 0, display: '0' },
        scoreB: { current: 0, display: '0' },
        status: 'SCHEDULED',
        startTime: new Date('2026-08-30T16:00:00Z'),
        venueCourt: 'Fatorda Stadium Main Arena',
        summary: 'Grand Final scheduled for Aug 30',
        isTestData: true,
      },
    ];

    for (const mDef of matchesDef) {
      const match = new Match(mDef);
      await match.save();
    }
    console.log('Seeded matches for Goa Champions Football Cup 2026.');

    // 5. Seed Notifications
    await Notification.deleteMany({ isTestData: true });

    const notificationsDef = [
      {
        recipient: seededPlayers[0]._id, // Player 01
        sender: seededOrganizers[0]._id,
        title: 'Registration Approved! ⚽',
        message: 'Your team "Goa Warriors" registration for Goa Champions Football Cup 2026 has been approved.',
        type: 'REGISTRATION',
        isRead: false,
        isTestData: true,
      },
      {
        recipient: seededPlayers[0]._id,
        sender: seededOrganizers[0]._id,
        title: 'Live Score Update 🔥',
        message: 'Semi Final 1 LIVE: Goa Warriors 2 - 1 Margao United (68\')',
        type: 'TOURNAMENT',
        isRead: true,
        isTestData: true,
      },
      {
        recipient: seededOrganizers[0]._id, // Organizer 01
        sender: seededPlayers[0]._id,
        title: 'New Team Registered 📋',
        message: 'Team "Goa Warriors" submitted registration for Goa Champions Football Cup 2026.',
        type: 'REGISTRATION',
        isRead: false,
        isTestData: true,
      },
    ];

    for (const nDef of notificationsDef) {
      const notif = new Notification(nDef);
      await notif.save();
    }
    console.log('Seeded notifications.');

    console.log('====================================================');
    console.log('TEST DATA SEED COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Seed test data error:', error);
    process.exit(1);
  }
};

seedTestData();
