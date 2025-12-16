import { Response } from 'express';
import Category from '../models/Category';

// Get all categories
export const getCategories = async (_req: any, res: Response): Promise<void> => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// Get category by name
export const getCategoryByName = async (req: any, res: Response): Promise<void> => {
    try {
        const { name } = req.params;

        const category = await Category.findOne({ name, isActive: true });

        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category'
        });
    }
};
