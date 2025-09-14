import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import Product from '../models/Product';

// Get dashboard analytics
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Date ranges for comparison
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Current month data
    const currentMonthOrders = await Order.find({
      createdAt: { $gte: currentMonthStart }
    });

    // Last month data for comparison
    const lastMonthOrders = await Order.find({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    // Calculate current month metrics
    const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + order.finalTotal, 0);
    const totalOrders = currentMonthOrders.length;
    const totalCustomers = new Set(currentMonthOrders.map(order => order.guestId)).size;
    
    // Calculate revenue by status (current month)
    const deliveredRevenue = currentMonthOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.finalTotal, 0);
    
    const pendingRevenue = currentMonthOrders
      .filter(order => order.status === 'pending')
      .reduce((sum, order) => sum + order.finalTotal, 0);
    
    const processingRevenue = currentMonthOrders
      .filter(order => ['confirmed', 'processing', 'shipped'].includes(order.status))
      .reduce((sum, order) => sum + order.finalTotal, 0);
    
    const cancelledRevenue = currentMonthOrders
      .filter(order => order.status === 'cancelled')
      .reduce((sum, order) => sum + order.finalTotal, 0);
    
    // Get total products
    const totalProducts = await Product.countDocuments();

    // Calculate last month metrics for comparison
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.finalTotal, 0);
    const lastMonthOrdersCount = lastMonthOrders.length;
    const lastMonthCustomers = new Set(lastMonthOrders.map(order => order.guestId)).size;

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    const ordersChange = lastMonthOrdersCount > 0 ? ((totalOrders - lastMonthOrdersCount) / lastMonthOrdersCount) * 100 : 0;
    const customersChange = lastMonthCustomers > 0 ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

    res.status(200).json({
      message: 'Dashboard analytics fetched successfully',
      status: 200,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange: Math.round(revenueChange * 100) / 100,
        ordersChange: Math.round(ordersChange * 100) / 100,
        customersChange: Math.round(customersChange * 100) / 100,
        productsChange: 0, // We don't track product changes yet
        revenueByStatus: {
          delivered: Math.round(deliveredRevenue * 100) / 100,
          pending: Math.round(pendingRevenue * 100) / 100,
          processing: Math.round(processingRevenue * 100) / 100,
          cancelled: Math.round(cancelledRevenue * 100) / 100
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard analytics',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent sales (last 7 days)
export const getRecentSales = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get orders from last 7 days
    const orders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });

    // Group orders by date
    const salesByDate: { [key: string]: { revenue: number; orders: number } } = {};
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { revenue: 0, orders: 0 };
      }
      salesByDate[date].revenue += order.finalTotal;
      salesByDate[date].orders += 1;
    });

    // Convert to array and fill missing dates
    const recentSales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      recentSales.push({
        date: dateStr,
        revenue: salesByDate[dateStr]?.revenue || 0,
        orders: salesByDate[dateStr]?.orders || 0
      });
    }

    res.status(200).json({
      message: 'Recent sales fetched successfully',
      status: 200,
      data: recentSales
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching recent sales',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get top performing products
export const getTopProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    // Aggregate top products by sales count and revenue
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]);

    const formattedProducts = topProducts.map(product => ({
      productId: product._id,
      name: product.name,
      sales: product.totalSales,
      revenue: Math.round(product.totalRevenue * 100) / 100
    }));

    res.status(200).json({
      message: 'Top products fetched successfully',
      status: 200,
      data: formattedProducts
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching top products',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get revenue by category
export const getRevenueByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all orders with items
    const orders = await Order.find({}).populate('items.productId');
    
    // Get all products to map categories
    const products = await Product.find({});
    const productCategoryMap: { [key: string]: string } = {};
    products.forEach(product => {
      productCategoryMap[product._id.toString()] = product.category;
    });

    // Calculate revenue by category
    const categoryRevenue: { [key: string]: number } = {};
    let totalRevenue = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        const category = productCategoryMap[item.productId] || 'Other';
        const itemRevenue = item.price * item.quantity;
        
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0;
        }
        categoryRevenue[category] += itemRevenue;
        totalRevenue += itemRevenue;
      });
    });

    // Convert to array with percentages
    const categoryBreakdown = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue * 100) / 100,
      percentage: Math.round((revenue / totalRevenue) * 10000) / 100 // Round to 2 decimal places
    })).sort((a, b) => b.revenue - a.revenue);

    res.status(200).json({
      message: 'Revenue by category fetched successfully',
      status: 200,
      data: categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching revenue by category',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get order status distribution
export const getOrderStatusDistribution = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalOrders = statusDistribution.reduce((sum, status) => sum + status.count, 0);
    
    const formattedDistribution = statusDistribution.map(status => ({
      status: status._id,
      count: status.count,
      percentage: Math.round((status.count / totalOrders) * 10000) / 100
    }));

    res.status(200).json({
      message: 'Order status distribution fetched successfully',
      status: 200,
      data: formattedDistribution
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching order status distribution',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
