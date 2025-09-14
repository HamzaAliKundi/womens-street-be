"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
// Get cart by guestId
exports.getCart = (0, express_async_handler_1.default)(async (req, res) => {
    const { guestId } = req.params;
    if (!guestId) {
        res.status(400).json({ message: 'Guest ID is required' });
        return;
    }
    let cart = await Cart_1.default.findOne({ guestId });
    if (!cart) {
        // Create new cart if doesn't exist
        cart = await Cart_1.default.create({
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
exports.addToCart = (0, express_async_handler_1.default)(async (req, res) => {
    const { guestId } = req.params;
    const { productId, quantity = 1 } = req.body;
    if (!guestId) {
        res.status(400).json({ message: 'Guest ID is required' });
        return;
    }
    if (!productId) {
        res.status(400).json({ message: 'Product ID is required' });
        return;
    }
    // Verify product exists
    const product = await Product_1.default.findById(productId);
    if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
    }
    // Check stock
    if (product.stockQuantity < quantity) {
        res.status(400).json({ message: 'Insufficient stock' });
        return;
    }
    let cart = await Cart_1.default.findOne({ guestId });
    if (!cart) {
        // Create new cart
        cart = new Cart_1.default({
            guestId,
            items: [],
            totalAmount: 0,
            totalItems: 0
        });
    }
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        // Check total stock
        if (product.stockQuantity < newQuantity) {
            res.status(400).json({ message: 'Insufficient stock for requested quantity' });
            return;
        }
        cart.items[existingItemIndex].quantity = newQuantity;
    }
    else {
        // Add new item
        cart.items.push({
            productId: product._id.toString(),
            quantity,
            price: product.price,
            name: product.name,
            image: product.images[0] || ''
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
exports.updateCartItem = (0, express_async_handler_1.default)(async (req, res) => {
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
    const cart = await Cart_1.default.findOne({ guestId });
    if (!cart) {
        res.status(404).json({ message: 'Cart not found' });
        return;
    }
    // Verify product exists and check stock
    const product = await Product_1.default.findById(productId);
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
exports.removeFromCart = (0, express_async_handler_1.default)(async (req, res) => {
    const { guestId, productId } = req.params;
    if (!guestId || !productId) {
        res.status(400).json({ message: 'Guest ID and Product ID are required' });
        return;
    }
    const cart = await Cart_1.default.findOne({ guestId });
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
exports.clearCart = (0, express_async_handler_1.default)(async (req, res) => {
    const { guestId } = req.params;
    if (!guestId) {
        res.status(400).json({ message: 'Guest ID is required' });
        return;
    }
    const cart = await Cart_1.default.findOne({ guestId });
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
