import Payment from '../models/Payment.js';
import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import { uploadImageBuffer } from '../config/cloudinary.js';
import { broadcastTournamentUpdate } from '../sockets/matchSocket.js';
import { createNotification } from '../utils/notify.js';

// @desc    Submit payment screenshot and transaction ID
// @route   POST /api/payments
export const submitPayment = async (req, res, next) => {
  try {
    const { registrationId, transactionId } = req.body;

    if (!registrationId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration ID and UPI Transaction ID / UTR.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a screenshot or image proof of your UPI payment.',
      });
    }

    const registration = await Registration.findById(registrationId).populate('tournament');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit payment for this registration.',
      });
    }

    // Upload screenshot to Cloudinary / storage
    const screenshotUrl = await uploadImageBuffer(
      req.file.buffer,
      req.file.mimetype,
      'payment_proofs'
    );

    // Create or update payment record
    let payment = await Payment.findOne({ registration: registration._id });
    if (payment) {
      payment.screenshotUrl = screenshotUrl;
      payment.transactionId = transactionId.trim();
      payment.status = 'PENDING';
      payment.rejectionReason = '';
      await payment.save();
    } else {
      payment = await Payment.create({
        user: req.user._id,
        tournament: registration.tournament._id,
        registration: registration._id,
        amount: registration.tournament.registrationFee,
        screenshotUrl,
        transactionId: transactionId.trim(),
        status: 'PENDING',
      });
    }

    // Link payment back to registration
    registration.payment = payment._id;
    registration.paymentStatus = 'PENDING';
    if (registration.status === 'REJECTED') {
      registration.status = 'PENDING';
    }
    await registration.save();

    // Notify tournament organizer
    if (registration.tournament?.organizer) {
      await createNotification({
        recipient: registration.tournament.organizer,
        sender: req.user._id,
        title: 'Payment Proof Submitted',
        message: `Team "${registration.teamName}" submitted UPI payment proof for "${registration.tournament.name}".`,
        type: 'PAYMENT',
        link: '/organizer-dashboard',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully! The tournament organizer will verify your payment.',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for a tournament (Organizer only)
// @route   GET /api/payments/tournament/:tournamentId
export const getTournamentPayments = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view payment records for this tournament.',
      });
    }

    const payments = await Payment.find({ tournament: req.params.tournamentId })
      .populate('user', 'name email phone profilePhoto profileImage')
      .populate('registration', 'teamName captainName contactPhone playersList')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment (Organizer accepts payment)
// @route   PUT /api/payments/:id/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tournament')
      .populate('registration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    const tournament = await Tournament.findById(payment.tournament._id);
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify payments for this tournament.',
      });
    }

    payment.status = 'VERIFIED';
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user._id;
    payment.rejectionReason = '';
    await payment.save();

    // Update corresponding registration
    const registration = await Registration.findById(payment.registration._id);
    if (registration) {
      registration.paymentStatus = 'VERIFIED';
      registration.rejectionReason = '';

      // If Aadhaar verification is also complete or not required, mark registration VERIFIED
      if (
        registration.aadhaarVerificationStatus === 'VERIFIED' ||
        registration.aadhaarVerificationStatus === 'NOT_REQUIRED'
      ) {
        registration.status = 'VERIFIED';
      }
      await registration.save();
    }

    // Update tournament verified registered count
    const verifiedCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: { $in: ['VERIFIED', 'APPROVED'] },
    });
    tournament.registeredTeamsCount = verifiedCount;
    await tournament.save();

    broadcastTournamentUpdate(tournament._id, {
      type: 'PAYMENT_VERIFIED',
      teamName: registration ? registration.teamName : '',
      registeredTeamsCount: verifiedCount,
    });

    // Notify player
    if (registration?.user) {
      await createNotification({
        recipient: registration.user,
        title: 'Payment Verified',
        message: `Your payment for "${tournament.name}" was approved by the organizer. Team entry confirmed!`,
        type: 'PAYMENT',
        link: '/player-dashboard',
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment verified! Team '${registration ? registration.teamName : ''}' is confirmed.`,
      payment,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject payment with mandatory reason (Organizer rejects payment)
// @route   PUT /api/payments/:id/reject
export const rejectPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory when rejecting payment proof.',
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('tournament')
      .populate('registration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    const tournament = await Tournament.findById(payment.tournament._id);
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage payments for this tournament.',
      });
    }

    payment.status = 'REJECTED';
    payment.rejectionReason = reason.trim();
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user._id;
    await payment.save();

    // Update registration status
    const registration = await Registration.findById(payment.registration._id);
    if (registration) {
      registration.paymentStatus = 'REJECTED';
      registration.rejectionReason = reason.trim();
      await registration.save();
    }

    // Recalculate verified count
    const verifiedCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: { $in: ['VERIFIED', 'APPROVED'] },
    });
    tournament.registeredTeamsCount = verifiedCount;
    await tournament.save();

    broadcastTournamentUpdate(tournament._id, {
      type: 'PAYMENT_REJECTED',
      teamName: registration ? registration.teamName : '',
      registeredTeamsCount: verifiedCount,
    });

    // Notify player with reason
    if (registration?.user) {
      await createNotification({
        recipient: registration.user,
        title: 'Payment Verification Rejected',
        message: `Your payment proof for "${tournament.name}" was rejected. Reason: ${reason.trim()}. Please re-upload valid proof.`,
        type: 'PAYMENT',
        link: '/player-dashboard',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment rejected. Reason recorded and participant notified.',
      payment,
      registration,
    });
  } catch (error) {
    next(error);
  }
};
