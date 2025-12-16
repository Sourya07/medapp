import { Request, Response } from 'express';
import Medicine from '../models/Medicine';

// Get medicines by category
export const getMedicinesByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;
        const { limit = 20, page = 1 } = req.query;

        const medicines = await Medicine.find({
            category,
            isActive: true,
            quantity: { $gt: 0 }
        })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Medicine.countDocuments({
            category,
            isActive: true,
            quantity: { $gt: 0 }
        });

        res.status(200).json({
            success: true,
            data: medicines,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching medicines by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch medicines'
        });
    }
};
