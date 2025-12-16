import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export interface AdminRequest extends Request {
    adminId?: string;
    admin?: any;
}

export const authenticateAdmin = async (
    req: AdminRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: string };

        // Find admin
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
            return;
        }

        // Attach admin to request
        req.adminId = decoded.adminId;
        req.admin = admin;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
