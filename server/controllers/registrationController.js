import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import Payment from '../models/Payment.js';
import { uploadImageBuffer } from '../config/cloudinary.js';
import { createNotification } from '../utils/notify.js';

// @desc    Register team for a tournament (with optional Aadhaar upload)
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

    // Handle Aadhaar document upload if present or required
    let aadhaarDocUrl = '';
    if (req.file) {
      aadhaarDocUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'aadhaar_docs');
    }

    const requiresAadhaar = tournament.requireAadhaarVerification === true;
    let parsedPlayers = [];
    if (playersList) {
      if (typeof playersList === 'string') {
        try {
          parsedPlayers = JSON.parse(playersList);
        } catch {
          parsedPlayers = [];
        }
      } else if (Array.isArray(playersList)) {
        parsedPlayers = playersList;
      }
    }

    const registration = await Registration.create({
      tournament: tournamentId,
      user: req.user._id,
      teamName: teamName.trim(),
      captainName: captainName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail || req.user.email,
      playersList: parsedPlayers,
      aadhaarDocument: aadhaarDocUrl,
      aadhaarVerificationStatus: requiresAadhaar ? (aadhaarDocUrl ? 'PENDING' : 'PENDING') : 'NOT_REQUIRED',
      paymentStatus: tournament.registrationFee === 0 ? 'NOT_APPLICABLE' : 'PENDING',
      status: tournament.registrationFee === 0 && !requiresAadhaar ? 'VERIFIED' : 'PENDING',
    });

    // If tournament is free and doesn't require Aadhaar verification, auto-increment count
    if (tournament.registrationFee === 0 && !requiresAadhaar) {
      tournament.registeredTeamsCount += 1;
      await tournament.save();
    }

    // Notify tournament organizer
    await createNotification({
      recipient: tournament.organizer,
      sender: req.user._id,
      title: 'New Team Registration',
      message: `"${teamName}" registered for your tournament "${tournament.name}".`,
      type: 'REGISTRATION',
      link: `/organizer-dashboard`,
    });

    // Notify user
    await createNotification({
      recipient: req.user._id,
      title: 'Registration Submitted',
      message: `Your registration for "${tournament.name}" was submitted successfully.`,
      type: 'REGISTRATION',
      link: `/player-dashboard`,
    });

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
      .populate('tournament', 'name sport venue location startDate endDate startTime registrationFee upiId qrCode status bannerImage requireAadhaarVerification')
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

// @desc    Get all registrations for a tournament (Organizer)
// @route   GET /api/registrations/tournament/:tournamentId
export const getTournamentRegistrations = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    // Check authorization: caller must be tournament organizer or admin
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view participant records for this tournament.',
      });
    }

    const registrations = await Registration.find({
      tournament: req.params.tournamentId,
    })
      .populate('user', 'name email phone profilePhoto profileImage')
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

// @desc    Get Aadhaar document securely (Only owner or tournament organizer)
// @route   GET /api/registrations/:id/aadhaar
export const getAadhaarDocument = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('tournament');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    const isOwner = registration.user.toString() === req.user._id.toString();
    const isOrganizer = registration.tournament?.organizer?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view this Aadhaar document.',
      });
    }

    if (!registration.aadhaarDocument) {
      return res.status(404).json({
        success: false,
        message: 'No Aadhaar document uploaded for this participant.',
      });
    }

    res.status(200).json({
      success: true,
      aadhaarDocument: registration.aadhaarDocument,
      status: registration.aadhaarVerificationStatus,
      rejectionReason: registration.aadhaarRejectionReason,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Player re-uploads corrected Aadhaar document
// @route   PUT /api/registrations/:id/aadhaar
export const reuploadAadhaar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document file (JPG, PNG, or PDF).',
      });
    }

    const registration = await Registration.findById(req.params.id).populate('tournament');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload documents for your own registration.',
      });
    }

    const docUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'aadhaar_docs');
    registration.aadhaarDocument = docUrl;
    registration.aadhaarVerificationStatus = 'PENDING';
    registration.aadhaarRejectionReason = '';
    await registration.save();

    // Notify organizer that updated Aadhaar was uploaded
    if (registration.tournament?.organizer) {
      await createNotification({
        recipient: registration.tournament.organizer,
        sender: req.user._id,
        title: 'Aadhaar Document Re-Submitted',
        message: `Team "${registration.teamName}" uploaded a new Aadhaar document for verification.`,
        type: 'AADHAAR',
        link: '/organizer-dashboard',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Aadhaar document re-uploaded successfully. Pending organizer verification.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Organizer verifies participant's Aadhaar document
// @route   PUT /api/registrations/:id/aadhaar/verify
export const verifyAadhaar = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('tournament');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    if (registration.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify documents for this tournament.',
      });
    }

    registration.aadhaarVerificationStatus = 'VERIFIED';
    registration.aadhaarRejectionReason = '';

    // If payment is verified or not applicable, confirm registration slot
    if (registration.paymentStatus === 'VERIFIED' || registration.paymentStatus === 'NOT_APPLICABLE') {
      if (registration.status !== 'VERIFIED') {
        registration.status = 'VERIFIED';
        const tournament = await Tournament.findById(registration.tournament._id);
        tournament.registeredTeamsCount += 1;
        await tournament.save();
      }
    }

    await registration.save();

    // Notify player
    await createNotification({
      recipient: registration.user,
      title: 'Aadhaar Verified',
      message: `Your Aadhaar document for "${registration.tournament.name}" was verified by the organizer.`,
      type: 'AADHAAR',
      link: '/player-dashboard',
    });

    res.status(200).json({
      success: true,
      message: 'Participant Aadhaar verified successfully.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Organizer rejects participant's Aadhaar document with reason
// @route   PUT /api/registrations/:id/aadhaar/reject
export const rejectAadhaar = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory.',
      });
    }

    const registration = await Registration.findById(req.params.id).populate('tournament');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    if (registration.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject documents for this tournament.',
      });
    }

    registration.aadhaarVerificationStatus = 'REJECTED';
    registration.aadhaarRejectionReason = reason.trim();
    await registration.save();

    // Notify player
    await createNotification({
      recipient: registration.user,
      title: 'Aadhaar Verification Rejected',
      message: `Your Aadhaar verification for "${registration.tournament.name}" was rejected. Reason: ${reason.trim()}`,
      type: 'AADHAAR',
      link: '/player-dashboard',
    });

    res.status(200).json({
      success: true,
      message: 'Participant Aadhaar rejected. Participant was notified with reason.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Organizer approves / updates general registration status
// @route   PUT /api/registrations/:id/status
export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const registration = await Registration.findById(req.params.id).populate('tournament');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    if (registration.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage registrations for this tournament.',
      });
    }

    const oldStatus = registration.status;
    registration.status = status;
    if (rejectionReason) registration.rejectionReason = rejectionReason;

    // Handle registered team count
    if (status === 'VERIFIED' && oldStatus !== 'VERIFIED') {
      const tournament = await Tournament.findById(registration.tournament._id);
      tournament.registeredTeamsCount += 1;
      await tournament.save();
    } else if (oldStatus === 'VERIFIED' && status !== 'VERIFIED') {
      const tournament = await Tournament.findById(registration.tournament._id);
      tournament.registeredTeamsCount = Math.max(0, tournament.registeredTeamsCount - 1);
      await tournament.save();
    }

    await registration.save();

    // Notify player
    await createNotification({
      recipient: registration.user,
      title: `Registration ${status}`,
      message: `Your team "${registration.teamName}" registration status was updated to ${status}.`,
      type: 'REGISTRATION',
      link: '/player-dashboard',
    });

    res.status(200).json({
      success: true,
      message: `Registration status updated to ${status}.`,
      registration,
    });
  } catch (error) {
    next(error);
  }
};
