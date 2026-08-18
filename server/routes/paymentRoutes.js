import express from 'express';
import {
  submitPayment,
  getTournamentPayments,
  verifyPayment,
  rejectPayment,
} from '../controllers/paymentController.js';
import { verifyAuth, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Player submits payment proof
router.post('/', verifyAuth, upload.single('screenshot'), submitPayment);

// Organizer accesses payment verification dashboard
router.get(
  '/tournament/:tournamentId',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  getTournamentPayments
);

// Organizer verifies payment
router.put(
  '/:id/verify',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  verifyPayment
);

// Organizer rejects payment with reason
router.put(
  '/:id/reject',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  rejectPayment
);

export default router;
