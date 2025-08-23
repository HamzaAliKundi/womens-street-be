import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './product';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

export default router; 