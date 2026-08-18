import express from 'express';
import {
  registerTeam,
  getMyRegistrations,
  getTournamentRegistrations,
  getAadhaarDocument,
  reuploadAadhaar,
  verifyAadhaar,
  rejectAadhaar,
  updateRegistrationStatus,
} from '../controllers/registrationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadDocument } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Participant registration & personal dashboard
router.post('/', protect, uploadDocument.single('aadhaarDocument'), registerTeam);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/:id/aadhaar', protect, getAadhaarDocument);
router.put('/:id/aadhaar', protect, uploadDocument.single('aadhaarDocument'), reuploadAadhaar);

// Organizer routes
router.get(
  '/tournament/:tournamentId',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  getTournamentRegistrations
);

router.put(
  '/:id/aadhaar/verify',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  verifyAadhaar
);

router.put(
  '/:id/aadhaar/reject',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  rejectAadhaar
);

router.put(
  '/:id/status',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  updateRegistrationStatus
);

export default router;
