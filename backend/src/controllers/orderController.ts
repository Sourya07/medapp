import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/Order';
import Medicine from '../models/Medicine';
import { AuthRequest } from '../middleware/auth';

// Create new order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId, items, notes } = req.body;

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Order must have at least one item'
            });
            return;
        }

        // Validate and calculate total
        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const medicine = await Medicine.findById(item.medicineId);

            if (!medicine) {
                res.status(404).json({
                    success: false,
                    message: `Medicine not found: ${item.medicineId}`
                });
                return;
            }

            if (medicine.quantity < item.quantity) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${medicine.name}`
                });
                return;
            }

            const itemTotal = medicine.price * item.quantity;
            totalPrice += itemTotal;

            orderItems.push({
                medicine: medicine._id,
                name: medicine.name,
                price: medicine.price,
                quantity: item.quantity
            });

            // Update medicine quantity
            medicine.quantity -= item.quantity;
            await medicine.save();
        }

        // Create order
        const order = await Order.create({
            user: req.userId,
            store: storeId,
            items: orderItems,
            totalPrice,
            notes
        });

        await order.populate('store', 'name address location contactNumber');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            _id: id,
            user: req.userId
        })
            .populate('store')
            .populate('user', 'mobileNumber');

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's order history
export const getOrderHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate('store', 'name address location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!Object.values(OrderStatus).includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
            return;
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('store user');

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get orders by store (admin only)
export const getOrdersByStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { status } = req.query;

        const filter: any = { store: storeId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('user', 'mobileNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching store orders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
