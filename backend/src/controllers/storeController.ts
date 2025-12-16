import { Request, Response } from 'express';
import Store from '../models/Store';
import { AuthRequest } from '../middleware/auth';

// Get nearby stores (within 50km radius)
export const getNearbyStores = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { latitude, longitude, radius } = req.query;

        // Use user's location if not provided
        let lat = Number(latitude);
        let lng = Number(longitude);

        if (!lat || !lng) {
            const user = req.user;
            if (user && user.location && user.location.coordinates) {
                lng = user.location.coordinates[0];
                lat = user.location.coordinates[1];
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Location coordinates are required'
                });
                return;
            }
        }

        const maxDistance = Number(radius) || 50; // Default 50km

        // Find stores within radius using geospatial query
        const stores = await Store.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistance * 1000, // Convert km to meters
                    spherical: true,
                    query: { isActive: true }
                }
            },
            {
                $project: {
                    name: 1,
                    address: 1,
                    location: 1,
                    contactNumber: 1,
                    openingHours: 1,
                    distance: { $divide: ['$distance', 1000] }, // Convert to km
                    serviceRadius: 1
                }
            },
            {
                $sort: { distance: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: stores.length,
            data: stores
        });
    } catch (error) {
        console.error('Error fetching nearby stores:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get store by ID
export const getStoreById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const store = await Store.findById(id);

        if (!store) {
            res.status(404).json({
                success: false,
                message: 'Store not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: store
        });
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create store (admin only)
export const createStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, address, latitude, longitude, contactNumber, serviceRadius, openingHours } = req.body;

        // Validate required fields
        if (!name || !address || !latitude || !longitude || !contactNumber) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }

        const store = await Store.create({
            name,
            address,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            contactNumber,
            serviceRadius: serviceRadius || 50,
            openingHours: openingHours || '24/7'
        });

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: store
        });
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update store (admin only)
export const updateStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If updating location
        if (updates.latitude && updates.longitude) {
            updates.location = {
                type: 'Point',
                coordinates: [updates.longitude, updates.latitude]
            };
            delete updates.latitude;
            delete updates.longitude;
        }

        const store = await Store.findByIdAndUpdate(id, updates, { new: true });

        if (!store) {
            res.status(404).json({
                success: false,
                message: 'Store not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Store updated successfully',
            data: store
        });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete store (admin only)
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const store = await Store.findByIdAndDelete(id);

        if (!store) {
            res.status(404).json({
                success: false,
                message: 'Store not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Store deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
