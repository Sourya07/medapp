import express from 'express';
import { adminLogin, createAdmin } from '../controllers/adminController';
import {
    createStore,
    updateStore,
    deleteStore
} from '../controllers/storeController';
import {
    createMedicine,
    updateMedicine,
    deleteMedicine
} from '../controllers/medicineController';
import {
    updateOrderStatus,
    getOrdersByStore
} from '../controllers/orderController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Admin auth (public)
router.post('/login', adminLogin);
router.post('/create', createAdmin); // Should be protected in production

// Store management (protected)
router.post('/stores', authenticateAdmin, createStore);
router.put('/stores/:id', authenticateAdmin, updateStore);
router.delete('/stores/:id', authenticateAdmin, deleteStore);

// Medicine management (protected)
router.post('/medicines', authenticateAdmin, createMedicine);
router.put('/medicines/:id', authenticateAdmin, updateMedicine);
router.delete('/medicines/:id', authenticateAdmin, deleteMedicine);

// Order management (protected)
router.put('/orders/:id/status', authenticateAdmin, updateOrderStatus);
router.get('/orders/store/:storeId', authenticateAdmin, getOrdersByStore);

export default router;
