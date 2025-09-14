import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '../utils/emailService';

// Create a new order
export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  const cart = await Cart.findOne({ guestId });
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ message: 'Cart is empty' });
    return;
  }

  // Verify all products are still available and in stock
  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.productId);
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
  const order = await Order.create({
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
    await Product.findByIdAndUpdate(
      cartItem.productId,
      { 
        $inc: { stockQuantity: -cartItem.quantity }
        // inStock will be automatically updated by pre-update hook based on stockQuantity
      }
    );
  }

  // Clear the cart after successful order
  await Cart.findOneAndUpdate(
    { guestId },
    { items: [], totalAmount: 0, totalItems: 0 }
  );

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
  sendOrderConfirmationEmail(emailData).catch(error => {
    console.error('Failed to send customer confirmation email:', error);
  });

  // Send admin notification emails
  sendAdminOrderNotification(emailData).catch(error => {
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
export const getOrdersByGuest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { guestId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!guestId) {
    res.status(400).json({ message: 'Guest ID is required' });
    return;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find({ guestId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ guestId });

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
export const getOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;

  if (!orderId) {
    res.status(400).json({ message: 'Order ID is required' });
    return;
  }

  const order = await Order.findById(orderId);
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
export const getOrderByNumber = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    res.status(400).json({ message: 'Order number is required' });
    return;
  }

  const order = await Order.findOne({ orderNumber });
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
export const getAllOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  const filter: any = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

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
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

  const order = await Order.findById(orderId);
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
