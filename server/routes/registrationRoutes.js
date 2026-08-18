import express from 'express';
import {
  registerTeam,
  getMyRegistrations,
  getTournamentRegistrations,
} from '../controllers/registrationController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route to register team (Player / Organizer)
router.post('/', verifyAuth, registerTeam);

// Protected route to view user's team registrations
router.get('/my-registrations', verifyAuth, getMyRegistrations);

// View registrations for a tournament (Public / Participants)
router.get('/tournament/:tournamentId', getTournamentRegistrations);

export default router;
