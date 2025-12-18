import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

import { auth } from '../services/firebase';

// Verify Firebase ID Token and login/register user
export const verifyFirebaseTokenController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400).json({
                success: false,
                message: 'ID Token is required'
            });
            return;
        }

        // 1. Verify ID Token with Firebase Admin
        let phone_number;

        // DEV BYPASS: Allow login without real Firebase Token if in Development
        // This is crucial for Expo Go where reCAPTCHA is hard to setup
        if (idToken === 'TEST-TOKEN-BYPASS' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
            console.warn('⚠️  USING DEV BYPASS FOR LOGIN ⚠️');
            // Expect mobileNumber to be passed in body for bypass
            if (req.body.mobileNumber) {
                // Mock the decoded token
                phone_number = '+91' + req.body.mobileNumber; // Assume Indian code for bypass
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Mobile number required for Dev Bypass'
                });
                return;
            }
        } else {
            // REAL FIREBASE VERIFICATION
            try {
                const decodedToken = await auth.verifyIdToken(idToken);
                phone_number = decodedToken.phone_number;
            } catch (authError) {
                console.error('Firebase Auth Verification Failed:', authError);
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired ID Token'
                });
                return;
            }
        }

        if (!phone_number) {
            // Should not happen for Phone Auth, but possible for other providers if not configured
            res.status(400).json({
                success: false,
                message: 'Phone number not found in Firebase Token'
            });
            return;
        }

        // Remove country code if needed or normalize (e.g., +91888... -> 888...)
        // Our DB stores 10 digits usually. 
        // Firebase returns E.164 (+91XXXXXXXXXX)
        const mobileNumber = phone_number.replace(/^\+91/, '').replace(/^\+/, ''); // specific to India or generic strip

        // 2. Find or Create User in MongoDB
        let user = await User.findOne({ mobileNumber });

        if (!user) {
            user = await User.create({ mobileNumber });
            console.log(`🆕 New User Created: ${mobileNumber}`);
        }

        // 3. Generate our own JWT Session Tokens (Same as before)
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';

        const accessToken = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            jwtRefreshSecret,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as jwt.SignOptions
        );

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    mobileNumber: user.mobileNumber,
                    location: user.location
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Error verifying Firebase Token:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Deprecated: Send OTP logic is now Client-Side (Firebase SDK)
// Keeping endpoint temporarily to prevent 404s if frontend calls it before update
export const sendOTPController = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
        success: true,
        message: 'Please use Firebase Client SDK to send OTP.'
    });
};

// Refresh access token
export const refreshTokenController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
            return;
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

        // Find user
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
            return;
        }

        // Generate new access token
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        const accessToken = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
        );

        res.status(200).json({
            success: true,
            data: { accessToken }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

// Update user location
export const updateLocationController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { latitude, longitude } = req.body;

        // Validate coordinates
        if (!latitude || !longitude) {
            res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
            return;
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
            return;
        }

        // Update user location
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: {
                location: user!.location
            }
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Flash Call Controller removed for Firebase Migration
