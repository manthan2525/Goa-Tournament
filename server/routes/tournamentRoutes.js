import express from 'express';
import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  startTournament,
  getOrganizerTournaments,
} from '../controllers/tournamentController.js';
import { verifyAuth, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTournaments);
router.get('/:id', getTournamentById);

// Protected routes (Organizer / Admin)
router.get(
  '/organizer/my-tournaments',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  getOrganizerTournaments
);

router.post(
  '/',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  upload.fields([
    { name: 'qrCode', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
  ]),
  createTournament
);

router.put(
  '/:id',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  upload.fields([
    { name: 'qrCode', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
  ]),
  updateTournament
);

router.post(
  '/:id/start',
  verifyAuth,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  startTournament
);

export default router;
