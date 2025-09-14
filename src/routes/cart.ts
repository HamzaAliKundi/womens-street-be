import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart';

const router = Router();

// All cart routes are PUBLIC (no authentication required for guest users)
router.get('/:guestId', getCart);                          // GET /cart/:guestId
router.post('/:guestId/add', addToCart);                   // POST /cart/:guestId/add
router.put('/:guestId/item/:productId', updateCartItem);   // PUT /cart/:guestId/item/:productId
router.delete('/:guestId/item/:productId', removeFromCart); // DELETE /cart/:guestId/item/:productId
router.delete('/:guestId/clear', clearCart);               // DELETE /cart/:guestId/clear

export default router;
