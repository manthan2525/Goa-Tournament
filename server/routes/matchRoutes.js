import express from 'express';
import {
  getTournamentMatches,
  getLiveMatches,
  getMatchById,
  updateMatchScore,
} from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/live', getLiveMatches);
router.get('/tournament/:tournamentId', getTournamentMatches);
router.get('/:id', getMatchById);

// Protected routes (Organizer / Admin)
router.put(
  '/:id/score',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  updateMatchScore
);

export default router;
