import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.delete('/profile-photo', protect, removeProfilePhoto);

export default router;
