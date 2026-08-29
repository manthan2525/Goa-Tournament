import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';
import Match from '../models/Match.js';
import Standings from '../models/Standings.js';
import Payment from '../models/Payment.js';
import { uploadImageBuffer } from '../config/cloudinary.js';
import {
  generateKnockoutFixtures,
  generateRoundRobinFixtures,
  generateGroupStageFixtures,
  generateGroupStageFromManualAssignments,
  generateKnockoutFromGroupStandings,
  generateGroupKnockoutFixtures,
} from '../utils/fixtureGenerator.js';
import { broadcastTournamentUpdate } from '../sockets/matchSocket.js';
import { createNotification } from '../utils/notify.js';

// @desc    Get all tournaments with search, filter, and sorting
// @route   GET /api/tournaments
export const getTournaments = async (req, res, next) => {
  try {
    const { sport, location, status, search, format, feeType, sortBy } = req.query;
    const filter = {};

    if (sport && sport !== 'All') {
      filter.sport = sport;
    }

    if (location && location !== 'All') {
      if (!filter.$and) filter.$and = [];
      filter.$and.push({
        $or: [
          { location: location },
          { "location.address": { $regex: location, $options: 'i' } }
        ]
      });
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (format && format !== 'All') {
      filter.format = format;
    }

    if (feeType === 'free') {
      filter.registrationFee = 0;
    } else if (feeType === 'paid') {
      filter.registrationFee = { $gt: 0 };
    }

    if (search && search.trim()) {
      const q = search.trim();
      if (!filter.$and) filter.$and = [];
      filter.$and.push({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { venue: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { sport: { $regex: q, $options: 'i' } },
        ]
      });
    }

    let sortOption = { startDate: 1, createdAt: -1 };
    if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sortBy === 'date') {
      sortOption = { startDate: 1 };
    } else if (sortBy === 'deadline') {
      sortOption = { registrationDeadline: 1 };
    } else if (sortBy === 'fee_low') {
      sortOption = { registrationFee: 1 };
    } else if (sortBy === 'fee_high') {
      sortOption = { registrationFee: -1 };
    }

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email phone organizationName profilePhoto profileImage')
      .sort(sortOption);

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
      'name email phone organizationName profilePhoto profileImage bio'
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    // Fetch verified teams without exposing sensitive Aadhaar document URLs publicly
    const verifiedRegistrations = await Registration.find({
      tournament: tournament._id,
      status: { $in: ['VERIFIED', 'APPROVED'] },
    }).select('teamName captainName contactPhone playersList status createdAt');

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
      startTime,
      registrationDeadline,
      registrationFee,
      upiId,
      format,
      maxTeams,
      teamSize,
      prizePool,
      rules,
      description,
      requireAadhaarVerification,
    } = req.body;

    if (!name || !venue || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required tournament fields.',
      });
    }

    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        // Assume it's an old-style string (e.g. "Panaji") if parsing fails
      }
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
      if (req.files.banner && req.files.banner[0]) {
        const file = req.files.banner[0];
        bannerImageUrl = await uploadImageBuffer(file.buffer, file.mimetype, 'banners');
      }
    }

    let parsedPrizes = [];
    if (req.body.prizes) {
      if (typeof req.body.prizes === 'string') {
        try {
          parsedPrizes = JSON.parse(req.body.prizes);
        } catch (e) {}
      } else if (Array.isArray(req.body.prizes)) {
        parsedPrizes = req.body.prizes;
      }
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      sport: sport || 'Football',
      organizer: req.user._id,
      venue: venue.trim(),
      location: parsedLocation,
      startDate,
      endDate,
      startTime: startTime || '09:00 AM',
      registrationDeadline: registrationDeadline || startDate,
      registrationFee: Number(registrationFee) || 0,
      upiId: upiId || '',
      qrCode: qrCodeUrl,
      bannerImage: bannerImageUrl,
      requireAadhaarVerification:
        requireAadhaarVerification === true ||
        requireAadhaarVerification === 'true' ||
        requireAadhaarVerification === '1',
      format: format || 'KNOCKOUT',
      maxTeams: Number(maxTeams) || 16,
      teamSize: Number(teamSize) || 11,
      prizePool: prizePool || '',
      prizes: parsedPrizes,
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
      if (req.files.banner && req.files.banner[0]) {
        const file = req.files.banner[0];
        req.body.bannerImage = await uploadImageBuffer(file.buffer, file.mimetype, 'banners');
      }
    }

    if (req.body.requireAadhaarVerification !== undefined) {
      req.body.requireAadhaarVerification =
        req.body.requireAadhaarVerification === true ||
        req.body.requireAadhaarVerification === 'true' ||
        req.body.requireAadhaarVerification === '1';
    }

    let parsedPrizes = [];
    if (req.body.prizes) {
      if (typeof req.body.prizes === 'string') {
        try {
          parsedPrizes = JSON.parse(req.body.prizes);
        } catch (e) {}
      } else if (Array.isArray(req.body.prizes)) {
        parsedPrizes = req.body.prizes;
      }
    }

    if (typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    if (req.body.prizes !== undefined) {
      req.body.prizes = parsedPrizes;
    }

    tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    broadcastTournamentUpdate(tournament._id, { tournament });

    // Notify registered participants that tournament details have been updated
    const registrations = await Registration.find({ tournament: tournament._id });
    for (const reg of registrations) {
      createNotification({
        recipient: reg.user,
        title: 'Tournament Updated',
        message: `Organizer updated details for "${tournament.name}". Check the tournament page for changes.`,
        type: 'TOURNAMENT',
        link: `/tournaments/${tournament._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tournament updated successfully.',
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tournament & safely purge associated data
// @route   DELETE /api/tournaments/:id
export const deleteTournament = async (req, res, next) => {
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
        message: 'You are not authorized to delete this tournament.',
      });
    }

    // Notify registered participants about cancellation before deletion
    const registrations = await Registration.find({ tournament: tournament._id });
    for (const reg of registrations) {
      createNotification({
        recipient: reg.user,
        title: 'Tournament Cancelled / Deleted',
        message: `The tournament "${tournament.name}" was cancelled or removed by the organizer.`,
        type: 'TOURNAMENT',
      });
    }

    // Safely delete associated data
    await Promise.all([
      Registration.deleteMany({ tournament: tournament._id }),
      Payment.deleteMany({ tournament: tournament._id }),
      Match.deleteMany({ tournament: tournament._id }),
      Standings.deleteMany({ tournament: tournament._id }),
      Tournament.findByIdAndDelete(req.params.id),
    ]);

    broadcastTournamentUpdate(tournament._id, { deleted: true, tournamentId: tournament._id });

    res.status(200).json({
      success: true,
      message: `Tournament "${tournament.name}" and associated records were deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set tournament winners & mark completed
// @route   PUT /api/tournaments/:id/winners
export const setTournamentWinners = async (req, res, next) => {
  try {
    const { winner, runnerUp, thirdPlace, winnerType } = req.body;

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
        message: 'Only the tournament organizer can declare tournament winners.',
      });
    }

    tournament.winner = winner || '';
    tournament.runnerUp = runnerUp || '';
    tournament.thirdPlace = thirdPlace || '';
    tournament.winnerType = winnerType || 'TEAM';
    tournament.status = 'COMPLETED';

    await tournament.save();

    broadcastTournamentUpdate(tournament._id, { tournament });

    // Notify all participants about winner announcement
    const registrations = await Registration.find({ tournament: tournament._id });
    for (const reg of registrations) {
      createNotification({
        recipient: reg.user,
        title: '🏆 Tournament Winners Announced!',
        message: `Winners for "${tournament.name}" have been published! Champion: ${winner || 'Announced'}.`,
        type: 'WINNER',
        link: `/tournaments/${tournament._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tournament winners declared successfully! Status updated to COMPLETED.',
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / replace tournament banner
// @route   POST /api/tournaments/:id/banner
export const uploadTournamentBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a banner image file.',
      });
    }

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
        message: 'Not authorized to update banner for this tournament.',
      });
    }

    const bannerUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'banners');
    tournament.bannerImage = bannerUrl;
    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Tournament banner updated successfully.',
      bannerImage: bannerUrl,
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove tournament banner
// @route   DELETE /api/tournaments/:id/banner
export const removeTournamentBanner = async (req, res, next) => {
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
        message: 'Not authorized to modify banner for this tournament.',
      });
    }

    tournament.bannerImage = '';
    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Tournament banner removed. Default banner will be displayed.',
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start tournament & auto-generate fixtures & standings (Idempotent & Stage-Aware)
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

    // Check existing matches in database to enforce idempotency
    const existingMatches = await Match.find({ tournament: tournament._id });

    // Handle SINGLE ELIMINATION (KNOCKOUT)
    if (tournament.format === 'KNOCKOUT') {
      if (existingMatches.length > 0) {
        return res.status(200).json({
          success: true,
          message: '✓ Knockout fixtures already generated. No duplicate fixtures were created.',
          matchesCount: existingMatches.length,
          fixtures: existingMatches,
          isExisting: true,
        });
      }

      const verifiedRegistrations = await Registration.find({
        tournament: tournament._id,
        status: { $in: ['VERIFIED', 'APPROVED'] },
      });

      if (verifiedRegistrations.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Cannot start tournament. Minimum 2 verified teams required (Current: ${verifiedRegistrations.length}).`,
        });
      }

      const fixtures = generateKnockoutFixtures(tournament._id, verifiedRegistrations, tournament.startDate);
      const insertedMatches = await Match.insertMany(fixtures);

      tournament.status = 'ONGOING';
      await tournament.save();

      broadcastTournamentUpdate(tournament._id, { status: 'ONGOING', matchesCount: insertedMatches.length });

      return res.status(200).json({
        success: true,
        message: `Tournament started! Generated ${insertedMatches.length} knockout fixtures successfully.`,
        matchesCount: insertedMatches.length,
        fixtures: insertedMatches,
      });
    }

    // Handle ROUND ROBIN
    if (tournament.format === 'ROUND_ROBIN') {
      if (existingMatches.length > 0) {
        return res.status(200).json({
          success: true,
          message: '✓ Round Robin fixtures already generated. No duplicate fixtures were created.',
          matchesCount: existingMatches.length,
          fixtures: existingMatches,
          isExisting: true,
        });
      }

      const verifiedRegistrations = await Registration.find({
        tournament: tournament._id,
        status: { $in: ['VERIFIED', 'APPROVED'] },
      });

      if (verifiedRegistrations.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Cannot start tournament. Minimum 2 verified teams required (Current: ${verifiedRegistrations.length}).`,
        });
      }

      const fixtures = generateRoundRobinFixtures(tournament._id, verifiedRegistrations, tournament.startDate);
      const insertedMatches = await Match.insertMany(fixtures);

      // Initialize Standings table
      const standingsRecords = verifiedRegistrations.map((reg) => ({
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
      }));
      await Standings.insertMany(standingsRecords);

      tournament.status = 'ONGOING';
      await tournament.save();

      broadcastTournamentUpdate(tournament._id, { status: 'ONGOING', matchesCount: insertedMatches.length });

      return res.status(200).json({
        success: true,
        message: `Tournament started! Generated ${insertedMatches.length} Round Robin fixtures.`,
        matchesCount: insertedMatches.length,
        fixtures: insertedMatches,
      });
    }

    // Handle GROUP STAGE + KNOCKOUT FINALS (GROUP_KNOCKOUT)
    if (tournament.format === 'GROUP_KNOCKOUT') {
      // Case 1: No fixtures generated yet -> Generate ONLY Group Stage
      if (existingMatches.length === 0) {
        const verifiedRegistrations = await Registration.find({
          tournament: tournament._id,
          status: { $in: ['VERIFIED', 'APPROVED'] },
        });

        if (verifiedRegistrations.length < 4) {
          return res.status(400).json({
            success: false,
            message: `Minimum 4 verified teams required for Group Stage (Current: ${verifiedRegistrations.length}).`,
          });
        }

        let groupFixtures = [];
        if (tournament.groupAssignmentMode === 'MANUAL' && tournament.groupAssignments && tournament.groupAssignments.length > 0) {
          // Check manual group assignments
          const assignedTeamIds = new Set(tournament.groupAssignments.map((a) => a.teamRegistrationId?.toString()));
          if (assignedTeamIds.size < 2) {
            return res.status(400).json({
              success: false,
              message: '⚠️ Please assign teams to groups before generating fixtures, or switch to Automatic mode.',
            });
          }
          groupFixtures = generateGroupStageFromManualAssignments(
            tournament._id,
            tournament.groupAssignments,
            verifiedRegistrations,
            tournament.startDate
          );
        } else {
          // Automatic mode
          const numGroups = tournament.numberOfGroups || (verifiedRegistrations.length >= 8 ? 4 : 2);
          groupFixtures = generateGroupStageFixtures(tournament._id, verifiedRegistrations, tournament.startDate, numGroups);

          // Save auto-assigned groups into tournament schema
          const teamGroups = {};
          groupFixtures.forEach((m) => {
            if (m.group && m.teamA?.name && m.teamA.name !== 'TBD' && m.teamA.registrationId) {
              teamGroups[m.teamA.registrationId.toString()] = { groupName: m.group, teamName: m.teamA.name, regId: m.teamA.registrationId };
            }
            if (m.group && m.teamB?.name && m.teamB.name !== 'TBD' && m.teamB.registrationId) {
              teamGroups[m.teamB.registrationId.toString()] = { groupName: m.group, teamName: m.teamB.name, regId: m.teamB.registrationId };
            }
          });

          const autoAssignments = Object.values(teamGroups).map((info) => ({
            groupName: info.groupName,
            teamRegistrationId: info.regId,
            teamName: info.teamName,
          }));

          tournament.groupAssignments = autoAssignments;
        }

        if (groupFixtures.length === 0) {
          return res.status(400).json({
            success: false,
            message: '⚠️ Unable to generate group fixtures. Please check team group assignments.',
          });
        }

        const insertedMatches = await Match.insertMany(groupFixtures);

        // Initialize Group Standings
        const teamGroups = {};
        insertedMatches.forEach((m) => {
          if (m.group && m.teamA?.name && m.teamA.name !== 'TBD') {
            teamGroups[m.teamA.name] = { group: m.group, regId: m.teamA.registrationId };
          }
          if (m.group && m.teamB?.name && m.teamB.name !== 'TBD') {
            teamGroups[m.teamB.name] = { group: m.group, regId: m.teamB.registrationId };
          }
        });

        const standingsRecords = Object.entries(teamGroups).map(([teamName, info]) => ({
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
        }));

        if (standingsRecords.length > 0) {
          await Standings.insertMany(standingsRecords);
        }

        tournament.status = 'ONGOING';
        await tournament.save();

        broadcastTournamentUpdate(tournament._id, { status: 'ONGOING', matchesCount: insertedMatches.length });

        return res.status(200).json({
          success: true,
          message: `Group Stage started! Generated ${insertedMatches.length} Group Stage fixtures. Complete all group matches to generate Knockout Finals.`,
          stage: 'GROUP',
          matchesCount: insertedMatches.length,
          fixtures: insertedMatches,
        });
      }

      // Case 2: Group stage exists. Check if Knockout stage ALREADY generated.
      const knockoutMatches = existingMatches.filter(
        (m) => m.roundIndex >= 10 || m.round?.includes('Semi-Final') || m.round?.includes('Final')
      );

      if (knockoutMatches.length > 0) {
        return res.status(200).json({
          success: true,
          message: '✓ Knockout fixtures already generated for this tournament. No duplicate fixtures created.',
          stage: 'KNOCKOUT_COMPLETE',
          matchesCount: existingMatches.length,
          fixtures: existingMatches,
          isExisting: true,
        });
      }

      // Case 3: Group stage exists, but Knockout NOT generated. Check if Group Stage is complete.
      const groupMatches = existingMatches.filter((m) => m.group || m.round?.startsWith('Group'));
      const incompleteGroupMatches = groupMatches.filter((m) => m.status !== 'COMPLETED');

      if (incompleteGroupMatches.length > 0) {
        return res.status(400).json({
          success: false,
          message: `⚠️ Knockout fixtures cannot be generated yet. Complete all Group Stage matches and standings first (${incompleteGroupMatches.length} group match(es) remaining).`,
          stage: 'GROUP_INCOMPLETE',
          matchesCount: existingMatches.length,
          fixtures: existingMatches,
        });
      }

      // Group stage is 100% complete! Generate Knockout Finals from Standings
      const standingsRecords = await Standings.find({ tournament: tournament._id });
      const maxMatchNumber = Math.max(...existingMatches.map((m) => m.matchNumber || 0), 0);

      const knockoutFixtures = generateKnockoutFromGroupStandings(
        tournament._id,
        standingsRecords,
        tournament.startDate,
        maxMatchNumber + 1
      );

      const insertedKnockout = await Match.insertMany(knockoutFixtures);
      const allMatches = [...existingMatches, ...insertedKnockout];

      broadcastTournamentUpdate(tournament._id, { status: 'ONGOING', matchesCount: allMatches.length });

      return res.status(200).json({
        success: true,
        message: `Generated ${insertedKnockout.length} Knockout Stage fixtures from qualified group teams successfully!`,
        stage: 'KNOCKOUT',
        matchesCount: allMatches.length,
        fixtures: allMatches,
      });
    }

    // Default fallback (Knockout)
    if (existingMatches.length > 0) {
      return res.status(200).json({
        success: true,
        message: '✓ Fixtures already exist for this tournament.',
        matchesCount: existingMatches.length,
        fixtures: existingMatches,
        isExisting: true,
      });
    }

    const verifiedRegistrations = await Registration.find({
      tournament: tournament._id,
      status: { $in: ['VERIFIED', 'APPROVED'] },
    });

    const fixtures = generateKnockoutFixtures(tournament._id, verifiedRegistrations, tournament.startDate);
    const insertedMatches = await Match.insertMany(fixtures);

    tournament.status = 'ONGOING';
    await tournament.save();

    return res.status(200).json({
      success: true,
      message: `Generated ${insertedMatches.length} fixtures successfully.`,
      matchesCount: insertedMatches.length,
      fixtures: insertedMatches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset tournament fixtures (Organizer & Admin only)
// @route   DELETE /api/tournaments/:id/fixtures
export const resetTournamentFixtures = async (req, res, next) => {
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
        message: 'Only the tournament organizer or admin can reset fixtures.',
      });
    }

    // Check if any match is currently LIVE
    const liveMatches = await Match.find({ tournament: tournament._id, status: 'LIVE' });
    if (liveMatches.length > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        isLive: true,
        message: '⚠️ A match is currently LIVE. Resetting fixtures will interrupt live score reporting.',
      });
    }

    // Remove ONLY matches & standings
    await Match.deleteMany({ tournament: tournament._id });
    await Standings.deleteMany({ tournament: tournament._id });

    const clearGroups = req.query.clearGroups === 'true';
    if (clearGroups) {
      tournament.groupAssignments = [];
      await Registration.updateMany({ tournament: tournament._id }, { assignedGroup: '' });
    }

    // Reset tournament status back to REGISTRATION_OPEN
    tournament.status = 'REGISTRATION_OPEN';
    tournament.winner = null;
    await tournament.save();

    broadcastTournamentUpdate(tournament._id, {
      status: 'REGISTRATION_OPEN',
      matchesCount: 0,
      reset: true,
    });

    res.status(200).json({
      success: true,
      message: clearGroups
        ? 'Fixtures, standings, and group assignments have been reset successfully.'
        : 'Fixtures and standings have been reset successfully. Group team assignments and registrations remain intact.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group assignments and verified teams for group management
// @route   GET /api/tournaments/:id/groups
export const getTournamentGroups = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const verifiedTeams = await Registration.find({
      tournament: tournament._id,
      status: { $in: ['VERIFIED', 'APPROVED'] },
    }).select('_id teamName captainName status assignedGroup');

    const assignedIds = new Set(tournament.groupAssignments?.map((a) => a.teamRegistrationId?.toString()) || []);
    const unassignedTeams = verifiedTeams.filter((t) => !assignedIds.has(t._id.toString()));

    res.status(200).json({
      success: true,
      mode: tournament.groupAssignmentMode || 'AUTOMATIC',
      numberOfGroups: tournament.numberOfGroups || 2,
      groupAssignments: tournament.groupAssignments || [],
      verifiedTeams,
      unassignedTeams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group assignments and group mode (Organizer & Admin only)
// @route   PUT /api/tournaments/:id/groups
export const updateTournamentGroups = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only the tournament organizer or admin can update group assignments.' });
    }

    const { mode, numberOfGroups, assignments } = req.body;

    if (mode) tournament.groupAssignmentMode = mode;
    if (numberOfGroups) tournament.numberOfGroups = Math.max(2, Math.min(8, Number(numberOfGroups)));

    if (assignments && Array.isArray(assignments)) {
      // Validate that a team registration ID is not assigned to multiple groups
      const seenTeams = new Map();
      for (const item of assignments) {
        if (!item.teamRegistrationId) continue;
        const regIdStr = item.teamRegistrationId.toString();
        if (seenTeams.has(regIdStr)) {
          const existingGroup = seenTeams.get(regIdStr);
          return res.status(400).json({
            success: false,
            message: `⚠️ Team "${item.teamName || 'Team'}" is already assigned to ${existingGroup}. A team can belong to ONLY ONE group.`,
          });
        }
        seenTeams.set(regIdStr, item.groupName);
      }

      tournament.groupAssignments = assignments.map((a) => ({
        groupName: a.groupName,
        teamRegistrationId: a.teamRegistrationId,
        teamName: a.teamName,
      }));

      // Update Registration assignedGroup fields
      await Registration.updateMany({ tournament: tournament._id }, { assignedGroup: '' });
      for (const a of assignments) {
        if (a.teamRegistrationId) {
          await Registration.findByIdAndUpdate(a.teamRegistrationId, { assignedGroup: a.groupName });
        }
      }
    }

    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Group stage settings and team assignments saved successfully!',
      mode: tournament.groupAssignmentMode,
      numberOfGroups: tournament.numberOfGroups,
      groupAssignments: tournament.groupAssignments,
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
        const pendingAadhaarCount = await Registration.countDocuments({
          tournament: t._id,
          aadhaarVerificationStatus: 'PENDING',
        });
        const totalRegistrations = await Registration.countDocuments({
          tournament: t._id,
        });
        const verifiedTeams = await Registration.countDocuments({
          tournament: t._id,
          status: { $in: ['VERIFIED', 'APPROVED'] },
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
          pendingAadhaarCount,
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
