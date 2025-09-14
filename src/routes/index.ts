import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './product';
import cartRoutes from './cart';
import orderRoutes from './order';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes); // Public cart routes
router.use('/order', orderRoutes); // Public order routes

export default router; 