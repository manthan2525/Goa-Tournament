import express from 'express';
import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  setTournamentWinners,
  uploadTournamentBanner,
  removeTournamentBanner,
  startTournament,
  resetTournamentFixtures,
  getTournamentGroups,
  updateTournamentGroups,
  getOrganizerTournaments,
} from '../controllers/tournamentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.get('/:id/groups', getTournamentGroups);

// Protected Organizer routes
router.get(
  '/organizer/my-tournaments',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  getOrganizerTournaments
);

router.post(
  '/',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  upload.fields([
    { name: 'qrCode', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  createTournament
);

router.put(
  '/:id',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  upload.fields([
    { name: 'qrCode', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  updateTournament
);

router.put(
  '/:id/groups',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  updateTournamentGroups
);

router.delete(
  '/:id',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  deleteTournament
);

router.put(
  '/:id/winners',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  setTournamentWinners
);

router.post(
  '/:id/banner',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  upload.single('banner'),
  uploadTournamentBanner
);

router.delete(
  '/:id/banner',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  removeTournamentBanner
);

router.post(
  '/:id/start',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  startTournament
);

router.delete(
  '/:id/fixtures',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  resetTournamentFixtures
);

export default router;
