import express from 'express';
import {
    createOrder,
    getOrderById,
    getOrderHistory,
    updateOrderStatus,
    getOrdersByStore,
    getAllOrders
} from '../controllers/orderController';
import { authenticateUser } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Admin routes (Moved up to prevent collision with /:id)
router.get('/all', authenticateAdmin, getAllOrders);
router.get('/store/:storeId', authenticateAdmin, getOrdersByStore);
router.put('/:id/status', authenticateAdmin, updateOrderStatus);

// User routes
router.post('/', authenticateUser, createOrder);
router.get('/history', authenticateUser, getOrderHistory);
router.get('/:id', authenticateUser, getOrderById);

export default router;
