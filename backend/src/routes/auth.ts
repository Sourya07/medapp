import express from 'express';
import {
    sendOTPController,
    verifyFirebaseTokenController,
    refreshTokenController,
    updateLocationController
} from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTPController); // Deprecated but kept for compatibility
router.post('/verify-firebase-token', verifyFirebaseTokenController);
// router.post('/verify-otp', verifyOTPController); // Deprecated
// router.post('/flash-call', initiateFlashCallController); // Removed
router.post('/refresh-token', refreshTokenController);

// Protected routes
router.post('/update-location', authenticateUser, updateLocationController);

export default router;
