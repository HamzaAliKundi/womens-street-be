import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart';
import Product from '../models/Product';

// Get cart by guestId
export const getCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { guestId } = req.params;

  if (!guestId) {
    res.status(400).json({ message: 'Guest ID is required' });
    return;
  }

  let cart = await Cart.findOne({ guestId });
  
  if (!cart) {
    // Create new cart if doesn't exist
    cart = await Cart.create({
      guestId,
      items: [],
      totalAmount: 0,
      totalItems: 0
    });
  }

  res.status(200).json({
    message: 'Cart fetched successfully',
    status: 200,
    cart
  });
});

// Add item to cart
export const addToCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { guestId } = req.params;
  const { productId, quantity = 1, selectedColor, selectedSize, selectedMaterial } = req.body;

  if (!guestId) {
    res.status(400).json({ message: 'Guest ID is required' });
    return;
  }

  if (!productId) {
    res.status(400).json({ message: 'Product ID is required' });
    return;
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  // Check stock
  if (product.stockQuantity < quantity) {
    res.status(400).json({ message: 'Insufficient stock' });
    return;
  }

  let cart = await Cart.findOne({ guestId });
  
  if (!cart) {
    // Create new cart
    cart = new Cart({
      guestId,
      items: [],
      totalAmount: 0,
      totalItems: 0
    });
  }

  // Check if item already exists in cart with same options
  const existingItemIndex = cart.items.findIndex(item => 
    item.productId === productId && 
    item.selectedColor === selectedColor && 
    item.selectedSize === selectedSize && 
    item.selectedMaterial === selectedMaterial
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    // Check total stock
    if (product.stockQuantity < newQuantity) {
      res.status(400).json({ message: 'Insufficient stock for requested quantity' });
      return;
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      productId: product._id.toString(),
      quantity,
      price: product.price,
      name: product.name,
      image: product.images[0] || '',
      selectedColor: selectedColor || undefined,
      selectedSize: selectedSize || undefined,
      selectedMaterial: selectedMaterial || undefined
    });
  }

  await cart.save();

  res.status(200).json({
    message: 'Item added to cart successfully',
    status: 200,
    cart
  });
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { guestId, productId } = req.params;
  const { quantity } = req.body;

  if (!guestId || !productId) {
    res.status(400).json({ message: 'Guest ID and Product ID are required' });
    return;
  }

  if (!quantity || quantity < 1) {
    res.status(400).json({ message: 'Quantity must be at least 1' });
    return;
  }

  const cart = await Cart.findOne({ guestId });
  if (!cart) {
    res.status(404).json({ message: 'Cart not found' });
    return;
  }

  // Verify product exists and check stock
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  if (product.stockQuantity < quantity) {
    res.status(400).json({ message: 'Insufficient stock' });
    return;
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    res.status(404).json({ message: 'Item not found in cart' });
    return;
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  res.status(200).json({
    message: 'Cart item updated successfully',
    status: 200,
    cart
  });
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { guestId, productId } = req.params;

  if (!guestId || !productId) {
    res.status(400).json({ message: 'Guest ID and Product ID are required' });
    return;
  }

  const cart = await Cart.findOne({ guestId });
  if (!cart) {
    res.status(404).json({ message: 'Cart not found' });
    return;
  }

  cart.items = cart.items.filter(item => item.productId !== productId);
  await cart.save();

  res.status(200).json({
    message: 'Item removed from cart successfully',
    status: 200,
    cart
  });
});

// Clear entire cart
export const clearCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { guestId } = req.params;

  if (!guestId) {
    res.status(400).json({ message: 'Guest ID is required' });
    return;
  }

  const cart = await Cart.findOne({ guestId });
  if (!cart) {
    res.status(404).json({ message: 'Cart not found' });
    return;
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    message: 'Cart cleared successfully',
    status: 200,
    cart
  });
});
