"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../controllers/order");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = (0, express_1.Router)();
// Public routes (no authentication required for guest orders)
router.post('/:guestId/create', order_1.createOrder); // POST /order/:guestId/create
router.get('/:guestId/orders', order_1.getOrdersByGuest); // GET /order/:guestId/orders
router.get('/single/:orderId', order_1.getOrder); // GET /order/single/:orderId
router.get('/number/:orderNumber', order_1.getOrderByNumber); // GET /order/number/:orderNumber
// Admin routes (authentication and admin role required)
router.get('/admin/all', auth_1.authMiddleware, admin_1.adminMiddleware, order_1.getAllOrders); // GET /order/admin/all
router.put('/admin/:orderId/status', auth_1.authMiddleware, admin_1.adminMiddleware, order_1.updateOrderStatus); // PUT /order/admin/:orderId/status
exports.default = router;
