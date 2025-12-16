import express from 'express';
import { getCategories, getCategoryByName } from '../controllers/categoryController';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:name', getCategoryByName);

export default router;
