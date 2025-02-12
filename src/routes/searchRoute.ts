import express from 'express';
import { searchProducts } from '../controllers/searchController';

const router = express.Router();

// Route to search products
router.get('/', searchProducts);

export default router;
