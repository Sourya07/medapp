import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

// Admin login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        // Find admin
        const admin = await Admin.findOne({ email });

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        const token = jwt.sign(
            { adminId: admin._id, role: admin.role },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create admin (for initial setup)
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
            return;
        }

        const admin = await Admin.create({
            email,
            password,
            role: role || 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: admin._id,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
