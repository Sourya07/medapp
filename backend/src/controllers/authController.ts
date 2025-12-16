import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import OTP from '../models/OTP';
import { generateOTP, sendOTP } from '../utils/otp';
import { AuthRequest } from '../middleware/auth';

// Send OTP to mobile number
export const sendOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobileNumber } = req.body;

        // Validate mobile number
        if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
            res.status(400).json({
                success: false,
                message: 'Invalid mobile number. Must be 10 digits.'
            });
            return;
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        await OTP.create({
            mobileNumber,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        // Send OTP via SMS
        const sent = await sendOTP(mobileNumber, otp);

        if (!sent) {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            expiresIn: 600 // seconds
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Verify OTP and login/register user
export const verifyOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mobileNumber, otp } = req.body;

        // Validate input
        if (!mobileNumber || !otp) {
            res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
            return;
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            mobileNumber,
            otp,
            verified: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
            return;
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Find or create user
        let user = await User.findOne({ mobileNumber });

        if (!user) {
            user = await User.create({ mobileNumber });
        }

        // Generate JWT tokens
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
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
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
