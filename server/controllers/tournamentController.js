import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';
import Match from '../models/Match.js';
import Standings from '../models/Standings.js';
import Payment from '../models/Payment.js';
import { uploadImageBuffer } from '../config/cloudinary.js';
import {
  generateKnockoutFixtures,
  generateRoundRobinFixtures,
  generateGroupKnockoutFixtures,
} from '../utils/fixtureGenerator.js';
import { broadcastTournamentUpdate } from '../sockets/matchSocket.js';

// @desc    Get all tournaments with filters
// @route   GET /api/tournaments
export const getTournaments = async (req, res, next) => {
  try {
    const { sport, location, status, search, format, feeMax } = req.query;
    const filter = {};

    if (sport && sport !== 'All') {
      filter.sport = sport;
    }

    if (location && location !== 'All') {
      filter.location = location;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (format && format !== 'All') {
      filter.format = format;
    }

    if (feeMax !== undefined && feeMax !== '') {
      filter.registrationFee = { $lte: Number(feeMax) };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email phone organizationName profileImage')
      .sort({ startDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tournaments.length,
      tournaments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tournament by ID
// @route   GET /api/tournaments/:id
export const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      'organizer',
      'name email phone organizationName profileImage bio'
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    // Fetch verified teams
    const verifiedRegistrations = await Registration.find({
      tournament: tournament._id,
      status: 'VERIFIED',
    }).select('teamName captainName contactPhone playersList createdAt');

    // Fetch total registration count
    const totalRegistrations = await Registration.countDocuments({
      tournament: tournament._id,
    });

    res.status(200).json({
      success: true,
      tournament,
      verifiedTeams: verifiedRegistrations,
      totalRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new tournament
// @route   POST /api/tournaments
export const createTournament = async (req, res, next) => {
  try {
    const {
      name,
      sport,
      venue,
      location,
      startDate,
      endDate,
      registrationDeadline,
      registrationFee,
      upiId,
      format,
      maxTeams,
      teamSize,
      prizePool,
      rules,
      description,
    } = req.body;

    if (!name || !venue || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required tournament fields.',
      });
    }

    let qrCodeUrl = '';
    let bannerImageUrl = '';

    // Handle files uploaded via multer
    if (req.files) {
      if (req.files.qrCode && req.files.qrCode[0]) {
        const file = req.files.qrCode[0];
        qrCodeUrl = await uploadImageBuffer(file.buffer, file.mimetype, 'qr_codes');
      }
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        const file = req.files.bannerImage[0];
        bannerImageUrl = await uploadImageBuffer(file.buffer, file.mimetype, 'banners');
      }
    }

    const tournament = await Tournament.create({
      name,
      sport: sport || 'Football',
      organizer: req.user._id,
      venue,
      location,
      startDate,
      endDate,
      registrationDeadline: registrationDeadline || startDate,
      registrationFee: Number(registrationFee) || 0,
      upiId: upiId || '',
      qrCode: qrCodeUrl,
      bannerImage: bannerImageUrl,
      format: format || 'KNOCKOUT',
      maxTeams: Number(maxTeams) || 16,
      teamSize: Number(teamSize) || 11,
      prizePool: prizePool || '',
      rules: rules || '',
      description: description || '',
      status: 'REGISTRATION_OPEN',
      registeredTeamsCount: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully! Registration is now open.',
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
export const updateTournament = async (req, res, next) => {
  try {
    let tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this tournament.',
      });
    }

    // Handle files if updated
    if (req.files) {
      if (req.files.qrCode && req.files.qrCode[0]) {
        const file = req.files.qrCode[0];
        req.body.qrCode = await uploadImageBuffer(file.buffer, file.mimetype, 'qr_codes');
      }
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        const file = req.files.bannerImage[0];
        req.body.bannerImage = await uploadImageBuffer(file.buffer, file.mimetype, 'banners');
      }
    }

    tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    broadcastTournamentUpdate(tournament._id, { tournament });

    res.status(200).json({
      success: true,
      message: 'Tournament updated successfully.',
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start tournament & auto-generate fixtures & standings
// @route   POST /api/tournaments/:id/start
export const startTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only the tournament organizer can start the tournament.',
      });
    }

    // Fetch verified teams
    const verifiedRegistrations = await Registration.find({
      tournament: tournament._id,
      status: 'VERIFIED',
    });

    if (verifiedRegistrations.length < 2) {
      return res.status(400).json({
        success: false,
        message: `Cannot start tournament. Minimum 2 verified teams required (Current: ${verifiedRegistrations.length}).`,
      });
    }

    // Clear old matches & standings if any (e.g. if re-generating)
    await Match.deleteMany({ tournament: tournament._id });
    await Standings.deleteMany({ tournament: tournament._id });

    let fixtures = [];
    if (tournament.format === 'KNOCKOUT') {
      fixtures = generateKnockoutFixtures(
        tournament._id,
        verifiedRegistrations,
        tournament.startDate
      );
    } else if (tournament.format === 'ROUND_ROBIN') {
      fixtures = generateRoundRobinFixtures(
        tournament._id,
        verifiedRegistrations,
        tournament.startDate
      );
    } else if (tournament.format === 'GROUP_KNOCKOUT') {
      fixtures = generateGroupKnockoutFixtures(
        tournament._id,
        verifiedRegistrations,
        tournament.startDate,
        verifiedRegistrations.length >= 8 ? 4 : 2
      );
    } else {
      fixtures = generateKnockoutFixtures(
        tournament._id,
        verifiedRegistrations,
        tournament.startDate
      );
    }

    // Insert generated matches
    const insertedMatches = await Match.insertMany(fixtures);

    // If league or group tournament, initialize Standings table
    if (tournament.format === 'ROUND_ROBIN' || tournament.format === 'GROUP_KNOCKOUT') {
      const standingsRecords = [];

      if (tournament.format === 'ROUND_ROBIN') {
        verifiedRegistrations.forEach((reg) => {
          standingsRecords.push({
            tournament: tournament._id,
            group: 'League',
            teamName: reg.teamName,
            registration: reg._id,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
          });
        });
      } else {
        // Group format: extract group assignments from first round group matches
        const teamGroups = {};
        insertedMatches.forEach((m) => {
          if (m.group && m.teamA?.name && m.teamA.name !== 'TBD') {
            teamGroups[m.teamA.name] = { group: m.group, regId: m.teamA.registrationId };
          }
          if (m.group && m.teamB?.name && m.teamB.name !== 'TBD') {
            teamGroups[m.teamB.name] = { group: m.group, regId: m.teamB.registrationId };
          }
        });

        Object.entries(teamGroups).forEach(([teamName, info]) => {
          standingsRecords.push({
            tournament: tournament._id,
            group: info.group,
            teamName,
            registration: info.regId,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
          });
        });
      }

      if (standingsRecords.length > 0) {
        await Standings.insertMany(standingsRecords);
      }
    }

    // Update tournament status to ONGOING
    tournament.status = 'ONGOING';
    await tournament.save();

    broadcastTournamentUpdate(tournament._id, {
      status: 'ONGOING',
      matchesCount: insertedMatches.length,
    });

    res.status(200).json({
      success: true,
      message: `Tournament started! Generated ${insertedMatches.length} fixtures successfully.`,
      matchesCount: insertedMatches.length,
      fixtures: insertedMatches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's tournaments with analytics
// @route   GET /api/tournaments/organizer/my-tournaments
export const getOrganizerTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find({ organizer: req.user._id }).sort({
      createdAt: -1,
    });

    const enrichedTournaments = await Promise.all(
      tournaments.map(async (t) => {
        const pendingPaymentsCount = await Payment.countDocuments({
          tournament: t._id,
          status: 'PENDING',
        });
        const totalRegistrations = await Registration.countDocuments({
          tournament: t._id,
        });
        const verifiedTeams = await Registration.countDocuments({
          tournament: t._id,
          status: 'VERIFIED',
        });
        const totalMatches = await Match.countDocuments({
          tournament: t._id,
        });
        const liveMatches = await Match.countDocuments({
          tournament: t._id,
          status: 'LIVE',
        });

        return {
          ...t.toObject(),
          pendingPaymentsCount,
          totalRegistrations,
          verifiedTeams,
          totalMatches,
          liveMatches,
        };
      })
    );

    res.status(200).json({
      success: true,
      tournaments: enrichedTournaments,
    });
  } catch (error) {
    next(error);
  }
};
