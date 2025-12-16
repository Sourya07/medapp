import express from 'express';
import {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/addressController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All address routes require authentication
router.use(authenticateUser);

// CRUD operations
router.get('/', getUserAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
