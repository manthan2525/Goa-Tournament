import express from 'express';
import {
  getTournamentComments,
  createComment,
  replyToComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getOrganizerComments,
} from '../controllers/commentController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// Tournament Comments Routes (Supports /api/tournaments/:tournamentId/comments OR /api/comments/tournament/:tournamentId)
router.get('/tournament/:tournamentId', optionalAuth, getTournamentComments);
router.post('/tournament/:tournamentId', protect, createComment);

// Organizer Comments Overview Route (for Organizer Dashboard)
router.get('/organizer/overview', protect, authorize('ORGANIZER', 'ADMIN'), getOrganizerComments);

// Direct Comment Routes
router.post('/:commentId/reply', protect, replyToComment);
router.put('/:commentId/reply', protect, updateComment); // Aliased
router.delete('/:commentId/reply', protect, deleteComment); // Aliased

router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);
router.post('/:commentId/like', protect, toggleLikeComment);

export default router;
