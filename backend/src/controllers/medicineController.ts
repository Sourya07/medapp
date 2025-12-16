import { Request, Response } from 'express';
import Medicine from '../models/Medicine';
import Store from '../models/Store';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/upload';

// Search medicines by name
export const searchMedicines = async (req: AuthRequest | any, res: Response): Promise<void> => {
    try {
        const { query, latitude, longitude, nearbyOnly } = req.query;

        if (!query) {
            res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
            return;
        }

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

            // Search medicines in nearby stores using regex for partial matching
            medicines = await Medicine.find({
                name: { $regex: query as string, $options: 'i' }, // Case-insensitive partial match
                store: { $in: storeIds },
                isActive: true,
                quantity: { $gt: 0 }
            })
                .populate('store', 'name address location contactNumber')
                .limit(50);
        } else {
            // Search all medicines using regex for partial matching
            medicines = await Medicine.find({
                name: { $regex: query as string, $options: 'i' }, // Case-insensitive partial match
                isActive: true,
                quantity: { $gt: 0 }
            })
                .populate('store', 'name address location contactNumber')
                .limit(50);
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

// Create medicine (admin only)
export const createMedicine = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, quantity, prescriptionRequired, store, category, manufacturer } = req.body;

        // Validate required fields
        if (!name || !description || !price || !store) {
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
            manufacturer
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
