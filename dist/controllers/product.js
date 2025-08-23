"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Product_1 = __importDefault(require("../models/Product"));
// Create a new product (Admin only)
exports.createProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, description, price, originalPrice, category, images, colors, stockQuantity, discount } = req.body;
    const product = await Product_1.default.create({
        name,
        description,
        price,
        originalPrice,
        category,
        images,
        colors,
        stockQuantity,
        discount: discount || 0,
        inStock: stockQuantity > 0
    });
    res.status(201).json({
        message: 'Product created successfully',
        status: 201,
        product
    });
});
// Get all products (with pagination and filtering)
exports.getProducts = (0, express_async_handler_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const search = req.query.search;
    const filter = {};
    if (category)
        filter.category = category;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = parseFloat(minPrice);
        if (maxPrice)
            filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
        filter.$text = { $search: search };
    }
    const skip = (page - 1) * limit;
    const products = await Product_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Product_1.default.countDocuments(filter);
    res.status(200).json({
        message: 'Products fetched successfully',
        status: 200,
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
// Get a single product by ID
exports.getProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const product = await Product_1.default.findById(id);
    if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
    }
    res.status(200).json({
        message: 'Product fetched successfully',
        status: 200,
        product
    });
});
// Update a product (Admin only)
exports.updateProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const product = await Product_1.default.findById(id);
    if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
    }
    // Update inStock based on stockQuantity
    if (updateData.stockQuantity !== undefined) {
        updateData.inStock = updateData.stockQuantity > 0;
    }
    const updatedProduct = await Product_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({
        message: 'Product updated successfully',
        status: 200,
        product: updatedProduct
    });
});
// Delete a product (Admin only)
exports.deleteProduct = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const product = await Product_1.default.findById(id);
    if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
    }
    await Product_1.default.findByIdAndDelete(id);
    res.status(200).json({
        message: 'Product deleted successfully',
        status: 200
    });
});
// Get products by category
exports.getProductsByCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const products = await Product_1.default.find({ category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await Product_1.default.countDocuments({ category });
    res.status(200).json({
        message: 'Products fetched successfully',
        status: 200,
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
// Search products
exports.searchProducts = (0, express_async_handler_1.default)(async (req, res) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (!q) {
        res.status(400).json({ message: 'Search query is required' });
        return;
    }
    const skip = (page - 1) * limit;
    const products = await Product_1.default.find({ $text: { $search: q } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit);
    const total = await Product_1.default.countDocuments({ $text: { $search: q } });
    res.status(200).json({
        message: 'Search results fetched successfully',
        status: 200,
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
