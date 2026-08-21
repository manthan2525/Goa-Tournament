import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict authentication middleware for all notification routes
router.use(protect);

router.get('/', getMyNotifications);

// Support both PUT and PATCH for markAllAsRead
router.put('/read-all', markAllAsRead);
router.patch('/read-all', markAllAsRead);

// Support both PUT and PATCH for single notification markAsRead
router.put('/:id/read', markAsRead);
router.patch('/:id/read', markAsRead);

router.delete('/:id', deleteNotification);

export default router;
