import express from 'express';
import {
    createOrder,
    getOrderById,
    getOrderHistory,
    updateOrderStatus,
    getOrdersByStore
} from '../controllers/orderController';
import { authenticateUser } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// User routes
router.post('/', authenticateUser, createOrder);
router.get('/history', authenticateUser, getOrderHistory);
router.get('/:id', authenticateUser, getOrderById);

// Admin routes
router.put('/:id/status', authenticateAdmin, updateOrderStatus);
router.get('/store/:storeId', authenticateAdmin, getOrdersByStore);

export default router;
