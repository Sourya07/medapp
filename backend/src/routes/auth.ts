import express from 'express';
import {
    sendOTPController,
    verifyOTPController,
    refreshTokenController,
    updateLocationController
} from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTPController);
router.post('/verify-otp', verifyOTPController);
router.post('/refresh-token', refreshTokenController);

// Protected routes
router.post('/update-location', authenticateUser, updateLocationController);

export default router;
