import express from 'express';
import {
  submitPayment,
  getTournamentPayments,
  verifyPayment,
  rejectPayment,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Player submits payment proof
router.post('/', protect, upload.single('screenshot'), submitPayment);

// Organizer accesses payment verification dashboard
router.get(
  '/tournament/:tournamentId',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  getTournamentPayments
);

// Organizer verifies payment
router.put(
  '/:id/verify',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  verifyPayment
);

// Organizer rejects payment with reason
router.put(
  '/:id/reject',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  rejectPayment
);

export default router;
