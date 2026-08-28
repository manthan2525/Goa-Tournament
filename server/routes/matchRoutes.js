import express from 'express';
import {
  getTournamentMatches,
  getLiveMatches,
  getMatchById,
  updateMatchScore,
  createManualMatch,
  createBatchManualMatches,
  updateManualMatch,
  deleteMatch,
} from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/live', getLiveMatches);
router.get('/tournament/:tournamentId', getTournamentMatches);
router.get('/:id', getMatchById);

// Protected routes (Organizer / Admin)
router.post(
  '/manual/batch',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  createBatchManualMatches
);

router.post(
  '/manual',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  createManualMatch
);

router.put(
  '/:id/score',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  updateMatchScore
);

router.put(
  '/:id/details',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  updateManualMatch
);

router.delete(
  '/:id',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  deleteMatch
);

export default router;
