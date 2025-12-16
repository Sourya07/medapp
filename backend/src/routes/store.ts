import express from 'express';
import {
    getNearbyStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore
} from '../controllers/storeController';
import { authenticateUser } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Public/User routes
router.get('/nearby', authenticateUser, getNearbyStores);
router.get('/:id', getStoreById);

// Admin routes
router.post('/', authenticateAdmin, createStore);
router.put('/:id', authenticateAdmin, updateStore);
router.delete('/:id', authenticateAdmin, deleteStore);

export default router;
