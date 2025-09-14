"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_1 = require("../controllers/cart");
const router = (0, express_1.Router)();
// All cart routes are PUBLIC (no authentication required for guest users)
router.get('/:guestId', cart_1.getCart); // GET /cart/:guestId
router.post('/:guestId/add', cart_1.addToCart); // POST /cart/:guestId/add
router.put('/:guestId/item/:productId', cart_1.updateCartItem); // PUT /cart/:guestId/item/:productId
router.delete('/:guestId/item/:productId', cart_1.removeFromCart); // DELETE /cart/:guestId/item/:productId
router.delete('/:guestId/clear', cart_1.clearCart); // DELETE /cart/:guestId/clear
exports.default = router;
