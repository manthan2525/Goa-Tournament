import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  deleteUser,
  toggleUserStatus,
  getOrganizers,
  getOrganizerById,
  deleteOrganizer,
  getAdminTournaments,
  getAdminTournamentById,
  updateAdminTournament,
  deleteAdminTournament,
  getAdminRegistrations,
  getReports,
  getActivityLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Strict Admin protection for all routes in this router
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Organizer Management
router.get('/organizers', getOrganizers);
router.get('/organizers/:id', getOrganizerById);
router.delete('/organizers/:id', deleteOrganizer);

// Tournament Management
router.get('/tournaments', getAdminTournaments);
router.get('/tournaments/:id', getAdminTournamentById);
router.put('/tournaments/:id', upload.single('bannerImage'), updateAdminTournament);
router.delete('/tournaments/:id', deleteAdminTournament);

// Registration Management
router.get('/registrations', getAdminRegistrations);

// Analytics & Audit Logs
router.get('/reports', getReports);
router.get('/activity-logs', getActivityLogs);

export default router;
