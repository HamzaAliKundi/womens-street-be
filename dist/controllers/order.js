"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getOrderByNumber = exports.getOrder = exports.getOrdersByGuest = exports.createOrder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Order_1 = __importDefault(require("../models/Order"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const emailService_1 = require("../utils/emailService");
// Create a new order
exports.createOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { guestId } = req.params;
    const { customerDetails } = req.body;
    if (!guestId) {
        res.status(400).json({ message: 'Guest ID is required' });
        return;
    }
    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
        res.status(400).json({ message: 'Customer details are required' });
        return;
    }
    // Get cart items
    const cart = await Cart_1.default.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: 'Cart is empty' });
        return;
    }
    // Verify all products are still available and in stock
    for (const cartItem of cart.items) {
        const product = await Product_1.default.findById(cartItem.productId);
        if (!product) {
            res.status(400).json({ message: `Product ${cartItem.name} is no longer available` });
            return;
        }
        if (product.stockQuantity < cartItem.quantity) {
            res.status(400).json({ message: `Insufficient stock for ${cartItem.name}. Available: ${product.stockQuantity}` });
            return;
        }
    }
    // Calculate totals
    const totalAmount = cart.totalAmount;
    const shippingCost = totalAmount >= 1000 ? 0 : 150; // Free shipping over PKR 1000
    const tax = totalAmount * 0.08; // 8% tax
    const finalTotal = totalAmount + shippingCost + tax;
    // Generate unique order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `WS${timestamp.slice(-6)}${random}`;
    // Create order
    const order = await Order_1.default.create({
        guestId,
        orderNumber,
        items: cart.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        customerDetails: {
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone,
            address: customerDetails.address,
            nearbyPlace: customerDetails.nearbyPlace || '',
            city: customerDetails.city,
            postalCode: customerDetails.postalCode || '',
            notes: customerDetails.notes || ''
        },
        totalAmount,
        totalItems: cart.totalItems,
        shippingCost,
        tax,
        finalTotal,
        paymentMethod: 'cash_on_delivery',
        status: 'pending'
    });
    // Update product stock quantities
    for (const cartItem of cart.items) {
        await Product_1.default.findByIdAndUpdate(cartItem.productId, {
            $inc: { stockQuantity: -cartItem.quantity }
            // inStock will be automatically updated by pre-update hook based on stockQuantity
        });
    }
    // Clear the cart after successful order
    await Cart_1.default.findOneAndUpdate({ guestId }, { items: [], totalAmount: 0, totalItems: 0 });
    // Send emails asynchronously (don't wait for them to complete)
    const emailData = {
        customerEmail: customerDetails.email,
        customerName: customerDetails.name,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        tax: order.tax,
        finalTotal: order.finalTotal,
        customerDetails: order.customerDetails,
        createdAt: order.createdAt,
        guestId: order.guestId
    };
    // Send customer confirmation email
    (0, emailService_1.sendOrderConfirmationEmail)(emailData).catch(error => {
        console.error('Failed to send customer confirmation email:', error);
    });
    // Send admin notification emails
    (0, emailService_1.sendAdminOrderNotification)(emailData).catch(error => {
        console.error('Failed to send admin notification emails:', error);
    });
    res.status(201).json({
        message: 'Order created successfully',
        status: 201,
        order: {
            _id: order._id,
            guestId: order.guestId,
            orderNumber: order.orderNumber,
            items: order.items,
            customerDetails: order.customerDetails,
            totalAmount: order.totalAmount,
            totalItems: order.totalItems,
            shippingCost: order.shippingCost,
            tax: order.tax,
            finalTotal: order.finalTotal,
            paymentMethod: order.paymentMethod,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }
    });
});
// Get orders by guest ID
exports.getOrdersByGuest = (0, express_async_handler_1.default)(async (req, res) => {
    const { guestId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (!guestId) {
        res.status(400).json({ message: 'Guest ID is required' });
        return;
    }
    const skip = (page - 1) * limit;
    const orders = await Order_1.default.find({ guestId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Order_1.default.countDocuments({ guestId });
    res.status(200).json({
        message: 'Orders fetched successfully',
        status: 200,
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
// Get single order by ID
exports.getOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
        res.status(400).json({ message: 'Order ID is required' });
        return;
    }
    const order = await Order_1.default.findById(orderId);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.status(200).json({
        message: 'Order fetched successfully',
        status: 200,
        order
    });
});
// Get order by order number
exports.getOrderByNumber = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderNumber } = req.params;
    if (!orderNumber) {
        res.status(400).json({ message: 'Order number is required' });
        return;
    }
    const order = await Order_1.default.findOne({ orderNumber });
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.status(200).json({
        message: 'Order fetched successfully',
        status: 200,
        order
    });
});
// Admin: Get all orders
exports.getAllOrders = (0, express_async_handler_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const filter = {};
    if (status)
        filter.status = status;
    const skip = (page - 1) * limit;
    const orders = await Order_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Order_1.default.countDocuments(filter);
    res.status(200).json({
        message: 'Orders fetched successfully',
        status: 200,
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
// Admin: Update order status
exports.updateOrderStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!orderId || !status) {
        res.status(400).json({ message: 'Order ID and status are required' });
        return;
    }
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
    }
    const order = await Order_1.default.findById(orderId);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    order.status = status;
    await order.save();
    res.status(200).json({
        message: 'Order status updated successfully',
        status: 200,
        order
    });
});
