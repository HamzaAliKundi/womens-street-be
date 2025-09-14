import { Router } from 'express';
import {
  createOrder,
  getOrdersByGuest,
  getOrder,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// Public routes (no authentication required for guest orders)
router.post('/:guestId/create', createOrder);                    // POST /order/:guestId/create
router.get('/:guestId/orders', getOrdersByGuest);               // GET /order/:guestId/orders
router.get('/single/:orderId', getOrder);                       // GET /order/single/:orderId
router.get('/number/:orderNumber', getOrderByNumber);           // GET /order/number/:orderNumber

// Admin routes (authentication and admin role required)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);           // GET /order/admin/all
router.put('/admin/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus); // PUT /order/admin/:orderId/status

export default router;
