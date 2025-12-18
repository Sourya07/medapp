import { Request, Response } from 'express';
import Medicine from '../models/Medicine';
import Store from '../models/Store';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/upload';

// Search medicines by name
export const searchMedicines = async (req: AuthRequest | any, res: Response): Promise<void> => {
    try {
        const { query, latitude, longitude, nearbyOnly, limit = 10, page = 1 } = req.query;
        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);
        const skip = (pageNum - 1) * limitNum;

        let medicines;

        // If nearbyOnly, find stores within 50km first
        if (nearbyOnly === 'true' && latitude && longitude) {
            let lat = Number(latitude);
            let lng = Number(longitude);

            // Find nearby stores
            const nearbyStores = await Store.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        distanceField: 'distance',
                        maxDistance: 50000, // 50km in meters
                        spherical: true,
                        query: { isActive: true }
                    }
                }
            ]);

            const storeIds = nearbyStores.map(store => store._id);

            const searchCriteria: any = {
                store: { $in: storeIds },
                isActive: true,
                quantity: { $gt: 0 }
            };

            if (query) {
                searchCriteria.name = { $regex: query as string, $options: 'i' };
            }

            // Search medicines in nearby stores
            medicines = await Medicine.find(searchCriteria)
                .populate('store', 'name address location contactNumber')
                .skip(skip)
                .limit(limitNum);
        } else {
            const searchCriteria: any = {
                isActive: true,
                quantity: { $gt: 0 }
            };

            if (query) {
                searchCriteria.name = { $regex: query as string, $options: 'i' };
            }

            // Search all medicines
            medicines = await Medicine.find(searchCriteria)
                .populate('store', 'name address location contactNumber')
                .skip(skip)
                .limit(limitNum);
        }

        res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (error) {
        console.error('Error searching medicines:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get medicine by ID
export const getMedicineById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findById(id).populate('store');

        if (!medicine) {
            res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get medicines by store
export const getMedicinesByStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;

        const medicines = await Medicine.find({
            store: storeId,
            isActive: true
        }).populate('store');

        res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

import { DEFAULT_STORE_ID } from '../config/constants';

// Create medicine (admin only)
export const createMedicine = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name, description, price, quantity, prescriptionRequired,
            store = DEFAULT_STORE_ID, category, subcategory, manufacturer,
            dosage, discount, imageUrl, isActive
        } = req.body;

        // Validate required fields
        if (!name || !description || !price) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }

        const medicine = await Medicine.create({
            name,
            description,
            price,
            quantity: quantity || 0,
            prescriptionRequired: prescriptionRequired || false,
            store,
            category,
            subcategory,
            manufacturer,
            dosage,
            discount: discount || 0,
            imageUrl,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Medicine created successfully',
            data: medicine
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update medicine (admin only)
export const updateMedicine = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const medicine = await Medicine.findByIdAndUpdate(id, updates, { new: true });

        if (!medicine) {
            res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Medicine updated successfully',
            data: medicine
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete medicine (admin only)
export const deleteMedicine = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findByIdAndDelete(id);

        if (!medicine) {
            res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Medicine deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Upload medicine image
export const uploadMedicineImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
            return;
        }

        const imageUrl = await uploadToCloudinary(req.file);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: { imageUrl }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
};
