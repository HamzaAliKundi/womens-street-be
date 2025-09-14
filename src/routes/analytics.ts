import express from 'express';
import {
  getDashboardAnalytics,
  getRecentSales,
  getTopProducts,
  getRevenueByCategory,
  getOrderStatusDistribution
} from '../controllers/analytics';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = express.Router();

// All analytics routes require authentication and admin access
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// Recent sales (last 7 days)
router.get('/recent-sales', getRecentSales);

// Top performing products
router.get('/top-products', getTopProducts);

// Revenue by category
router.get('/revenue-by-category', getRevenueByCategory);

// Order status distribution
router.get('/order-status', getOrderStatusDistribution);

export default router;
