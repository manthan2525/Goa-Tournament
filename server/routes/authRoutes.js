import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyAuth, getMe);

export default router;
