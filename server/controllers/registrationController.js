import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import Payment from '../models/Payment.js';

// @desc    Register team for a tournament
// @route   POST /api/registrations
export const registerTeam = async (req, res, next) => {
  try {
    const {
      tournamentId,
      teamName,
      captainName,
      contactPhone,
      contactEmail,
      playersList,
    } = req.body;

    if (!tournamentId || !teamName || !captainName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tournament ID, team name, captain name, and contact phone.',
      });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    if (tournament.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({
        success: false,
        message: `Registrations for this tournament are currently ${tournament.status}.`,
      });
    }

    // Check if max teams reached
    if (tournament.registeredTeamsCount >= tournament.maxTeams) {
      return res.status(400).json({
        success: false,
        message: 'Tournament registration is full.',
      });
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      tournament: tournamentId,
      user: req.user._id,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered a team for this tournament.',
        registrationId: existingRegistration._id,
      });
    }

    const registration = await Registration.create({
      tournament: tournamentId,
      user: req.user._id,
      teamName: teamName.trim(),
      captainName: captainName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail || req.user.email,
      playersList: Array.isArray(playersList) ? playersList : [],
      status: tournament.registrationFee === 0 ? 'VERIFIED' : 'PENDING',
    });

    // If tournament is free, auto-increment registered count
    if (tournament.registrationFee === 0) {
      tournament.registeredTeamsCount += 1;
      await tournament.save();
    }

    res.status(201).json({
      success: true,
      message:
        tournament.registrationFee > 0
          ? 'Registration submitted! Please complete the QR payment to verify your team entry.'
          : 'Team successfully registered for tournament!',
      registration,
      isFree: tournament.registrationFee === 0,
      fee: tournament.registrationFee,
      upiId: tournament.upiId,
      qrCode: tournament.qrCode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current player's registrations
// @route   GET /api/registrations/my-registrations
export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('tournament', 'name sport venue location startDate endDate registrationFee upiId qrCode status bannerImage')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations for a tournament (Organizer / Public view)
// @route   GET /api/registrations/tournament/:tournamentId
export const getTournamentRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      tournament: req.params.tournamentId,
    })
      .populate('user', 'name email phone profileImage')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};
