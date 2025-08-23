import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts
} from '../controllers/product';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// Public routes (no authentication required)
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// Admin routes (authentication and admin role required)
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
