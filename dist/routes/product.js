"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_1 = require("../controllers/product");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.get('/', product_1.getProducts);
router.get('/categories', product_1.getCategories); // New categories endpoint
router.get('/search', product_1.searchProducts);
router.get('/category/:category', product_1.getProductsByCategory);
router.get('/:id', product_1.getProduct);
// Admin routes (authentication and admin role required)
router.post('/', auth_1.authMiddleware, admin_1.adminMiddleware, product_1.createProduct);
router.put('/:id', auth_1.authMiddleware, admin_1.adminMiddleware, product_1.updateProduct);
router.delete('/:id', auth_1.authMiddleware, admin_1.adminMiddleware, product_1.deleteProduct);
exports.default = router;
