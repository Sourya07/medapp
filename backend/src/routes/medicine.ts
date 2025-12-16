import express from 'express';
import {
    searchMedicines,
    getMedicineById,
    getMedicinesByStore,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    uploadMedicineImage
} from '../controllers/medicineController';
import { getMedicinesByCategory } from '../controllers/categoryMedicineController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { upload } from '../utils/upload';

const router = express.Router();

// Public/User routes (no auth required for browsing)
router.get('/search', searchMedicines); // Allow guest browsing
router.get('/category/:category', getMedicinesByCategory); // Get by category
router.get('/store/:storeId', getMedicinesByStore);
router.get('/:id', getMedicineById);

// Admin routes
router.post('/', authenticateAdmin, createMedicine);
router.put('/:id', authenticateAdmin, updateMedicine);
router.delete('/:id', authenticateAdmin, deleteMedicine);
router.post('/upload-image', authenticateAdmin, upload.single('image'), uploadMedicineImage);

export default router;
