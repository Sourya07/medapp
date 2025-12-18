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
        const authHeader = req.header('Authorization');
        console.log('[AuthDebug] Auth Header:', authHeader);

        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            console.log('[AuthDebug] No token provided');
            res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
            return;
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        console.log('[AuthDebug] Using Secret:', jwtSecret === 'default-secret' ? 'default-secret' : '***ENV_VAR***');

        try {
            const decoded = jwt.verify(token, jwtSecret) as { adminId: string };
            console.log('[AuthDebug] Decoded Token:', decoded);

            // Find admin
            const admin = await Admin.findById(decoded.adminId);
            console.log('[AuthDebug] Admin Found:', admin ? admin.email : 'NOT FOUND');

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
            console.log('[AuthDebug] Token Verification Failed:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('[AuthDebug] Unexpected Error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};
