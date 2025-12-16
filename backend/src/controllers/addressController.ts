import { Response } from 'express';
import Address from '../models/Address';
import { AuthRequest } from '../middleware/auth';

// Get all addresses for the logged-in user
export const getUserAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const addresses = await Address.find({ user: req.user._id })
            .sort({ isDefault: -1, createdAt: -1 }); // Default first, then newest

        res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create a new address
export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            name,
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2,
            landmark,
            pincode,
            latitude,
            longitude,
            isDefault
        } = req.body;

        // Validation
        if (!name || !fullName || !phoneNumber || !addressLine1 || !landmark || !pincode || !latitude || !longitude) {
            res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
            return;
        }

        // Validate pincode
        if (!/^[0-9]{6}$/.test(pincode)) {
            res.status(400).json({
                success: false,
                message: 'Invalid pincode format'
            });
            return;
        }

        // If this is the first address, make it default
        const addressCount = await Address.countDocuments({ user: req.user._id });
        const shouldBeDefault = addressCount === 0 || isDefault;

        const address = await Address.create({
            user: req.user._id,
            name,
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2,
            landmark,
            pincode,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            isDefault: shouldBeDefault
        });

        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: address
        });
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update an existing address
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2,
            landmark,
            pincode,
            latitude,
            longitude
        } = req.body;

        // Find address and verify ownership
        const address = await Address.findOne({ _id: id, user: req.user._id });

        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found'
            });
            return;
        }

        // Update fields
        if (name) address.name = name;
        if (fullName) address.fullName = fullName;
        if (phoneNumber) address.phoneNumber = phoneNumber;
        if (addressLine1) address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
        if (landmark) address.landmark = landmark;
        if (pincode) {
            if (!/^[0-9]{6}$/.test(pincode)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pincode format'
                });
                return;
            }
            address.pincode = pincode;
        }
        if (latitude && longitude) {
            address.location.coordinates = [longitude, latitude];
        }

        await address.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete an address
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found'
            });
            return;
        }

        // If deleted address was default, make another address default
        if (address.isDefault) {
            const nextAddress = await Address.findOne({ user: req.user._id });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Set an address as default
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, user: req.user._id });

        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found'
            });
            return;
        }

        address.isDefault = true;
        await address.save(); // Pre-save hook will unset other defaults

        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            data: address
        });
    } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
